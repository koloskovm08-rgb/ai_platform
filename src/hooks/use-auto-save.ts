'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './use-debounce';

export interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void> | void;
  interval?: number; // Интервал автосохранения в мс
  enabled?: boolean;
  debounceMs?: number; // Задержка перед сохранением после изменений
}

export function useAutoSave({
  data,
  onSave,
  interval = 30000, // 30 секунд
  enabled = true,
  debounceMs = 2000, // 2 секунды после последнего изменения
}: UseAutoSaveOptions) {
  const lastSaveRef = useRef<number>(0);
  const isSavingRef = useRef(false);
  const dataRef = useRef(data);

  // Обновляем ref при изменении data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Debounced сохранение при изменении данных
  const debouncedSave = useDebounce(
    useCallback(async () => {
      if (!enabled || isSavingRef.current) return;

      try {
        isSavingRef.current = true;
        await onSave(dataRef.current);
        lastSaveRef.current = Date.now();
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, [enabled, onSave]),
    debounceMs
  );

  // Сохранение при изменении данных
  useEffect(() => {
    if (enabled && data) {
      debouncedSave();
    }
  }, [data, enabled, debouncedSave]);

  // Периодическое сохранение
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(async () => {
      const timeSinceLastSave = Date.now() - lastSaveRef.current;
      if (timeSinceLastSave >= interval && !isSavingRef.current) {
        try {
          isSavingRef.current = true;
          await onSave(dataRef.current);
          lastSaveRef.current = Date.now();
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          isSavingRef.current = false;
        }
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, onSave]);

  // Сохранение при закрытии страницы
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSavingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  return {
    isSaving: isSavingRef.current,
    lastSaveTime: lastSaveRef.current,
  };
}

