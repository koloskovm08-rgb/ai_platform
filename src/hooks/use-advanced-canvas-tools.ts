'use client';

import { useEffect, useState } from 'react';
import type { Canvas } from 'fabric';
import {
  setupMultiSelect,
  setupSmartGuides,
  setupEnhancedSnapToGrid,
  setupEnhancedBoundingBox,
  toggleSmartGuides,
  toggleSnapToGrid,
} from '@/lib/utils/advanced-tools';

export interface AdvancedCanvasToolsOptions {
  multiSelect?: boolean;
  smartGuides?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  showGrid?: boolean;
}

export function useAdvancedCanvasTools(
  canvas: Canvas | null,
  options: AdvancedCanvasToolsOptions = {}
) {
  const {
    multiSelect = true,
    smartGuides = true,
    snapToGrid = true,
    gridSize = 20,
    showGrid = false,
  } = options;

  const [smartGuidesEnabled, setSmartGuidesEnabled] = useState(smartGuides);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(snapToGrid);
  const [gridVisible, setGridVisible] = useState(showGrid);

  useEffect(() => {
    if (!canvas) return;

    // Настройка multi-select
    if (multiSelect) {
      setupMultiSelect(canvas);
    }

    // Настройка smart guides
    setupSmartGuides(canvas, smartGuidesEnabled);

    // Настройка snap-to-grid
    setupEnhancedSnapToGrid(canvas, gridSize, snapToGridEnabled, gridVisible);

    // Настройка расширенного bounding box
    setupEnhancedBoundingBox(canvas);
  }, [
    canvas,
    multiSelect,
    smartGuidesEnabled,
    snapToGridEnabled,
    gridSize,
    gridVisible,
  ]);

  const toggleSmartGuidesHandler = (enabled: boolean) => {
    if (!canvas) return;
    setSmartGuidesEnabled(enabled);
    toggleSmartGuides(canvas, enabled);
  };

  const toggleSnapToGridHandler = (enabled: boolean, show: boolean = false) => {
    if (!canvas) return;
    setSnapToGridEnabled(enabled);
    setGridVisible(show);
    toggleSnapToGrid(canvas, enabled, gridSize, show);
  };

  return {
    smartGuidesEnabled,
    snapToGridEnabled,
    gridVisible,
    toggleSmartGuides: toggleSmartGuidesHandler,
    toggleSnapToGrid: toggleSnapToGridHandler,
  };
}

