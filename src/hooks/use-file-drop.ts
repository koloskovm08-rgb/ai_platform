'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseFileDropOptions {
  onDrop: (files: File[]) => void;
  accept?: string; // MIME types, например "image/*"
  multiple?: boolean;
  disabled?: boolean;
}

export function useFileDrop({
  onDrop,
  accept,
  multiple = true,
  disabled = false,
}: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      const files: File[] = [];
      if (e.dataTransfer?.files) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          if (accept) {
            // Проверяем MIME type
            if (accept.includes('*') || accept.includes(file.type)) {
              files.push(file);
            }
          } else {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        const filesToProcess = multiple ? files : [files[0]];
        onDrop(filesToProcess);
      }
    },
    [disabled, accept, multiple, onDrop]
  );

  const dropZoneProps = {
    onDragEnter: handleDragEnter as any,
    onDragLeave: handleDragLeave as any,
    onDragOver: handleDragOver as any,
    onDrop: handleDrop as any,
  };

  return {
    isDragging,
    dropZoneProps,
  };
}

