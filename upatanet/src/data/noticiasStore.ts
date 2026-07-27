export interface Noticia {
  id: number;
  title: string;
  snippet: string;
  body: string;
  date: string;
  category: string;
  likes: number;
  dislikes: number;
}

type Listener = () => void;

const listeners: Set<Listener> = new Set();

function notify() {
  for (const fn of listeners) {
    fn();
  }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let noticias: Noticia[] = [
  {
    id: 1,
    title: "Ola de paludismo en Hasupuwei",
    snippet:
      "Han aumentado considerablemente los contagios y afectados por el pal...",
    body: "Han aumentado considerablemente los contagios y afectados por el paludismo en la comunidad de Upata. Se necesita atención médica urgente.",
    date: "17/03/26",
    category: "salud",
    likes: 15,
    dislikes: 1,
  },
  {
    id: 2,
    title: "Llegaron insumos a Mahekoto-teri",
    snippet: "Entre los insumos que se recibieron están: mantas, cob...",
    body: "Entre los insumos que se recibieron están: mantas, cobijas, medicamentos y alimentos no perecederos para la comunidad de Mahekoto-teri.",
    date: "21/05/26",
    category: "insumos",
    likes: 8,
    dislikes: 0,
  },
  {
    id: 3,
    title: "Tala de árboles cerca de Comun...",
    snippet:
      "Han aumentado considerablemente los contagios y afectados por el pal...",
    body: "Se ha reportado tala indiscriminada de árboles en los alrededores de la comunidad. Solicitamos intervención de las autoridades ambientales.",
    date: "17/03/26",
    category: "naturaleza",
    likes: 12,
    dislikes: 2,
  },
  {
    id: 4,
    title: "Se esperan fuertes lluvias estos días",
    snippet:
      "Han aumentado considerablemente los contagios y afectados por el pal...",
    body: "El servicio meteorológico ha emitido alerta por fuertes lluvias en la región durante los próximos días. Se recomienda tomar precauciones.",
    date: "17/03/26",
    category: "alertas",
    likes: 5,
    dislikes: 0,
  },
];

export function getNoticias(): Noticia[] {
  return noticias;
}

export function getNoticiaById(id: number): Noticia | undefined {
  return noticias.find((n) => n.id === id);
}

let nextId = 5;

export function publishNoticia(data: {
  title: string;
  body: string;
  category: string;
}): number {
  const id = nextId++;
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getFullYear()).slice(2)}`;
  const noticia: Noticia = {
    id,
    title: data.title,
    snippet: data.body.length > 60 ? data.body.slice(0, 57) + "..." : data.body,
    body: data.body,
    date,
    category: data.category,
    likes: 0,
    dislikes: 0,
  };
  noticias = [noticia, ...noticias];
  notify();
  return id;
}

export function likeNoticia(id: number): void {
  noticias = noticias.map((n) =>
    n.id === id ? { ...n, likes: n.likes + 1 } : n,
  );
  notify();
}

export function dislikeNoticia(id: number): void {
  noticias = noticias.map((n) =>
    n.id === id ? { ...n, dislikes: n.dislikes + 1 } : n,
  );
  notify();
}
