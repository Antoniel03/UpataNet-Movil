import { useCallback, useEffect, useState } from "react";
import {
  getNoticias,
  getNoticiaById,
  publishNoticia as storePublish,
  likeNoticia as storeLike,
  dislikeNoticia as storeDislike,
  subscribe,
  type Noticia,
} from "@/src/data/noticiasStore";

export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  const loadNoticias = useCallback(async () => {
    const data = await getNoticias();
    setNoticias(data);
  }, []);

  useEffect(() => {
    loadNoticias();
  }, [loadNoticias]);

  useEffect(() => {
    const unsub = subscribe(() => {
      loadNoticias();
    });
    return unsub;
  }, [loadNoticias]);

  const publish = useCallback(
    async (data: { title: string; body: string; category: string }) => {
      const id = await storePublish(data);
      return id;
    },
    [],
  );

  const getById = useCallback(async (id: number) => {
    return getNoticiaById(id);
  }, []);

  const like = useCallback(async (id: number) => {
    await storeLike(id);
  }, []);

  const dislike = useCallback(async (id: number) => {
    await storeDislike(id);
  }, []);

  return {
    noticias,
    publishNoticia: publish,
    getById,
    likeNoticia: like,
    dislikeNoticia: dislike,
  };
}
