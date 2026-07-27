const Y = require("yjs");
const syncProtocol = require("y-protocols/sync");
const awarenessProtocol = require("y-protocols/awareness");
const encoding = require("lib0/encoding");
const decoding = require("lib0/decoding");
const ws = require("ws");

const PORT = 1234;
const messageSync = 0;
const messageAwareness = 1;

const doc = new Y.Doc();
const awareness = new awarenessProtocol.Awareness(doc);
const clients = new Set();

awareness.on("update", ({ added, updated, removed }, origin) => {
  const changed = added.concat(updated, removed);
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageAwareness);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(awareness, changed),
  );
  const message = encoding.toUint8Array(encoder);
  for (const client of clients) {
    if (client !== origin) {
      client.send(Buffer.from(message));
    }
  }
});

doc.on("update", (update, origin) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeUpdate(encoder, update);
  const message = encoding.toUint8Array(encoder);
  for (const client of clients) {
    if (client !== origin) {
      client.send(Buffer.from(message));
    }
  }
});

const wss = new ws.Server({ port: PORT });

wss.on("connection", (conn) => {
  clients.add(conn);
  conn.binaryType = "arraybuffer";

  const syncEncoder = encoding.createEncoder();
  encoding.writeVarUint(syncEncoder, messageSync);
  syncProtocol.writeSyncStep1(syncEncoder, doc);
  conn.send(Buffer.from(encoding.toUint8Array(syncEncoder)));

  const awEncoder = encoding.createEncoder();
  encoding.writeVarUint(awEncoder, messageAwareness);
  encoding.writeVarUint8Array(
    awEncoder,
    awarenessProtocol.encodeAwarenessUpdate(
      awareness,
      Array.from(awareness.getStates().keys()),
    ),
  );
  conn.send(Buffer.from(encoding.toUint8Array(awEncoder)));

  conn.on("message", (data) => {
    const decoder = decoding.createDecoder(new Uint8Array(data));
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
        if (encoding.length(encoder) > 1) {
          conn.send(Buffer.from(encoding.toUint8Array(encoder)));
        }
        break;
      }
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          awareness,
          decoding.readVarUint8Array(decoder),
          conn,
        );
        break;
      }
    }
  });

  conn.on("close", () => {
    clients.delete(conn);
  });
});

console.log(`Sync server listening on ws://localhost:${PORT}`);
