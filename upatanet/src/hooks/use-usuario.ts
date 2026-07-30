import {
  checkRegistration,
  getIsRegistered,
  loadPerfil,
  savePerfil as storeSavePerfil,
  subscribe,
} from "@/src/data/usuario-store";
import type { PerfilData } from "@/src/repositories/usuarioRepository";
import { useCallback, useEffect, useState } from "react";

export function useUsuario() {
  const [isRegistered, setIsRegistered] = useState(getIsRegistered());
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [registered, data] = await Promise.all([
      checkRegistration(),
      loadPerfil(),
    ]);
    setIsRegistered(registered);
    setPerfil(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unsub = subscribe(() => {
      refresh();
    });
    return unsub;
  }, [refresh]);

  const save = useCallback(
    async (data: PerfilData) => {
      await storeSavePerfil(data);
      await refresh();
    },
    [refresh],
  );

  return {
    isRegistered,
    perfil,
    loading,
    savePerfil: save,
    refresh,
  };
}
