'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Download } from 'lucide-react';
import type { Canvas } from 'fabric';
import { motion } from 'framer-motion';

interface Mockup3DPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: Canvas | null;
  cardWidth: number;
  cardHeight: number;
}

export function Mockup3DPreview({
  open,
  onOpenChange,
  canvas,
  cardWidth,
  cardHeight,
}: Mockup3DPreviewProps) {
  const [rotationX, setRotationX] = React.useState(-15);
  const [rotationY, setRotationY] = React.useState(25);
  const [lightIntensity, setLightIntensity] = React.useState(0.8);
  const mockupRef = React.useRef<HTMLDivElement>(null);
  const [mockupImage, setMockupImage] = React.useState<string | null>(null);

  // Генерируем изображение canvas для mockup
  React.useEffect(() => {
    if (!canvas || !open) return;

    const generateMockupImage = () => {
      try {
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        });
        setMockupImage(dataURL);
      } catch (error) {
        console.error('Error generating mockup image:', error);
      }
    };

    generateMockupImage();
  }, [canvas, open]);

  const handleReset = () => {
    setRotationX(-15);
    setRotationY(25);
    setLightIntensity(0.8);
  };

  const handleDownload = () => {
    if (!mockupImage) return;

    const link = document.createElement('a');
    link.download = `business-card-mockup-${Date.now()}.png`;
    link.href = mockupImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Вычисляем размеры для mockup (сохраняем пропорции)
  const aspectRatio = cardWidth / cardHeight;
  const mockupWidth = 400;
  const mockupHeight = mockupWidth / aspectRatio;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>3D Mockup Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 3D Mockup */}
          <div
            ref={mockupRef}
            className="relative w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden"
            style={{
              perspective: '1000px',
            }}
          >
            <motion.div
              className="relative"
              style={{
                width: mockupWidth,
                height: mockupHeight,
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateX: `${rotationX}deg`,
                rotateY: `${rotationY}deg`,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Визитка с тенью и отражением */}
              <div
                className="absolute inset-0 rounded-lg shadow-2xl"
                style={{
                  transform: 'translateZ(20px)',
                  boxShadow: `
                    0 ${20 * lightIntensity}px ${40 * lightIntensity}px rgba(0, 0, 0, ${0.3 * lightIntensity}),
                    inset 0 1px 0 rgba(255, 255, 255, ${0.5 * lightIntensity}),
                    inset 0 -1px 0 rgba(0, 0, 0, ${0.1 * lightIntensity})
                  `,
                }}
              >
                {mockupImage ? (
                  <Image
                    src={mockupImage}
                    alt="Business card mockup"
                    width={mockupWidth}
                    height={mockupHeight}
                    className="w-full h-full object-cover rounded-lg"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Загрузка...</p>
                  </div>
                )}
              </div>

              {/* Отражение на поверхности */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  background: `linear-gradient(
                    ${180 + rotationY}deg,
                    rgba(255, 255, 255, ${0.3 * lightIntensity}) 0%,
                    transparent 50%
                  )`,
                  transform: 'translateZ(21px)',
                }}
              />
            </motion.div>

            {/* Интерактивные контролы для поворота */}
            <div className="absolute inset-0 cursor-grab active:cursor-grabbing" />
          </div>

          {/* Контролы */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Поворот X: {rotationX}°</label>
              <input
                type="range"
                min="-45"
                max="45"
                value={rotationX}
                onChange={(e) => setRotationX(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Поворот Y: {rotationY}°</label>
              <input
                type="range"
                min="-45"
                max="45"
                value={rotationY}
                onChange={(e) => setRotationY(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Освещение: {Math.round(lightIntensity * 100)}%</label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Действия */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={!mockupImage}>
              <Download className="h-4 w-4 mr-2" />
              Скачать mockup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

