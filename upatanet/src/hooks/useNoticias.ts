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
  const [noticias, setNoticias] = useState<Noticia[]>(() => getNoticias());

  useEffect(() => {
    const unsub = subscribe(() => {
      setNoticias(getNoticias());
    });
    return unsub;
  }, []);

  const publish = useCallback(
    (data: { title: string; body: string; category: string }) => {
      return storePublish(data);
    },
    [],
  );

  const getById = useCallback((id: number) => {
    return getNoticiaById(id);
  }, []);

  const like = useCallback((id: number) => {
    storeLike(id);
  }, []);

  const dislike = useCallback((id: number) => {
    storeDislike(id);
  }, []);

  return { noticias, publishNoticia: publish, getById, likeNoticia: like, dislikeNoticia: dislike };
}
