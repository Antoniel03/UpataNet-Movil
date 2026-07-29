import { useCallback, useEffect, useRef } from 'react';
import { useNoticias } from '@/src/hooks/useNoticias';
import type { AlarmStatus } from '@/hooks/use-ble-alarm';

interface UseAlarmaPublicacionProps {
  status: AlarmStatus;
  enabled?: boolean;
}

export function useAlarmaPublicacion({ status, enabled = true }: UseAlarmaPublicacionProps) {
  const { publishNoticia } = useNoticias();
  const publishedRef = useRef(false);

  const publish = useCallback(async () => {
    if (publishedRef.current) return;
    publishedRef.current = true;
    await publishNoticia({
      title: 'Alerta comunitaria disparada',
      body: 'Se activó la alarma de emergencia desde la comunidad. Se requiere atención inmediata.',
      category: 'alertas',
    });
  }, [publishNoticia]);

  useEffect(() => {
    if (!enabled) return;

    if (status === 'triggered') {
      publish();
    } else {
      publishedRef.current = false;
    }
  }, [status, enabled, publish]);
}
