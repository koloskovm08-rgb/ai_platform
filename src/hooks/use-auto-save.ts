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
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);

  // Обновляем refs при изменении пропсов
  useEffect(() => {
    dataRef.current = data;
    onSaveRef.current = onSave;
    enabledRef.current = enabled;
  }, [data, onSave, enabled]);

  // Debounced сохранение при изменении данных
  const saveFunction = useCallback(async () => {
    if (!enabledRef.current || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      await onSaveRef.current(dataRef.current);
      lastSaveRef.current = Date.now();
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  const debouncedSave = useDebounce(saveFunction, debounceMs);

  // Сохранение при изменении данных
  useEffect(() => {
    if (enabled && data) {
      debouncedSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // Вызываем только при изменении data

  // Периодическое сохранение
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(async () => {
      const timeSinceLastSave = Date.now() - lastSaveRef.current;
      if (timeSinceLastSave >= interval && !isSavingRef.current) {
        try {
          isSavingRef.current = true;
          await onSaveRef.current(dataRef.current);
          lastSaveRef.current = Date.now();
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          isSavingRef.current = false;
        }
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval]);

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

