'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  shouldDisableAnimations,
  getOptimalParticleCount,
  getOptimalOrbCount,
  getAnimationPreference,
} from '@/lib/utils/performance';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  angle: number;
  angleSpeed: number;
}

interface GradientOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  angle: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<GradientOrb[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const lastFrameTimeRef = useRef<number>(0);
  const targetFPS = 30; // Ограничение FPS до 30

  useEffect(() => {
    const frameInterval = 1000 / targetFPS;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Проверка пользовательской настройки
    const userPreference = getAnimationPreference();
    if (userPreference === true) {
      setShouldAnimate(false);
      return;
    }

    // Проверка производительности устройства
    if (shouldDisableAnimations()) {
      setShouldAnimate(false);
      return;
    }

    // Проверка prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldAnimate(false);
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false }); // Отключить альфа-канал для производительности
    if (!ctx) return;

    // Определяем количество частиц на основе производительности устройства
    const getParticleCount = () => {
      const optimalCount = getOptimalParticleCount();
      const width = window.innerWidth;
      const isMobile = width < 768;
      
      // Дополнительное уменьшение на мобильных
      if (isMobile) {
        return Math.max(5, Math.floor(optimalCount * 0.5));
      }
      
      return optimalCount;
    };

    const getOrbCount = () => {
      const optimalCount = getOptimalOrbCount();
      const width = window.innerWidth;
      const isMobile = width < 768;
      
      // На мобильных еще меньше
      if (isMobile && optimalCount > 0) {
        return 1;
      }
      
      return optimalCount;
    };

    // Цвета для светлой и тёмной темы
    const particleColors = {
      light: ['#60a5fa', '#c084fc', '#fb923c', '#34d399', '#f472b6'],
      dark: ['#3b82f6', '#a855f7', '#06b6d4', '#10b981', '#ec4899'],
    };

    const orbColors = {
      light: [
        'rgba(96, 165, 250, 0.3)',
        'rgba(192, 132, 252, 0.3)',
        'rgba(251, 146, 60, 0.3)',
        'rgba(52, 211, 153, 0.3)',
      ],
      dark: [
        'rgba(59, 130, 246, 0.4)',
        'rgba(168, 85, 247, 0.4)',
        'rgba(6, 182, 212, 0.4)',
        'rgba(16, 185, 129, 0.4)',
      ],
    };

    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? particleColors.dark : particleColors.light;
    const orbColorSet = isDark ? orbColors.dark : orbColors.light;

    // Функция для создания частицы
    const createParticle = (): Particle => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02,
      };
    };

    // Функция для создания градиентного пятна
    const createOrb = (): GradientOrb => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 150 + 100,
        color: orbColorSet[Math.floor(Math.random() * orbColorSet.length)],
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        angle: Math.random() * Math.PI * 2,
      };
    };

    // Инициализация размера canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const particleCount = getParticleCount();
      const orbCount = getOrbCount();

      particlesRef.current = Array.from({ length: particleCount }, createParticle);
      orbsRef.current = Array.from({ length: orbCount }, createOrb);
    };

    resizeCanvas();
    initParticles();

    // Обработчик изменения размера окна
    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Функция отрисовки градиентного пятна
    const drawOrb = (orb: GradientOrb) => {
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      gradient.addColorStop(0, orb.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.filter = 'blur(40px)';
      ctx.fillRect(
        orb.x - orb.radius,
        orb.y - orb.radius,
        orb.radius * 2,
        orb.radius * 2
      );
      ctx.filter = 'none';
    };

    // Функция отрисовки частицы
    const drawParticle = (particle: Particle) => {
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = gradient;
      ctx.filter = 'blur(2px)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    };

    // Функция обновления позиции частицы
    const updateParticle = (particle: Particle) => {
      particle.angle += particle.angleSpeed;
      particle.x += particle.speedX + Math.sin(particle.angle) * 0.5;
      particle.y += particle.speedY + Math.cos(particle.angle) * 0.5;

      // Wrap around edges
      if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
      if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
      if (particle.y > canvas.height + particle.size) particle.y = -particle.size;

      // Постепенное изменение прозрачности
      particle.opacity += (Math.random() - 0.5) * 0.01;
      particle.opacity = Math.max(0.2, Math.min(0.8, particle.opacity));
    };

    // Функция обновления позиции пятна
    const updateOrb = (orb: GradientOrb) => {
      orb.angle += 0.001;
      orb.x += orb.speedX + Math.sin(orb.angle) * 0.1;
      orb.y += orb.speedY + Math.cos(orb.angle) * 0.1;

      // Bounce off edges
      if (orb.x - orb.radius < 0 || orb.x + orb.radius > canvas.width) {
        orb.speedX *= -1;
      }
      if (orb.y - orb.radius < 0 || orb.y + orb.radius > canvas.height) {
        orb.speedY *= -1;
      }
    };

    // Проверка видимости страницы
    const handleVisibilityChange = () => {
      setShouldAnimate(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Основной цикл анимации с ограничением FPS
    const animate = (currentTime: number) => {
      if (!shouldAnimate) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Ограничение FPS
      const elapsed = currentTime - lastFrameTimeRef.current;
      if (elapsed < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime - (elapsed % frameInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Отрисовка градиентных пятен
      orbsRef.current.forEach((orb) => {
        updateOrb(orb);
        drawOrb(orb);
      });

      // Отрисовка частиц
      particlesRef.current.forEach((particle) => {
        updateParticle(particle);
        drawParticle(particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    lastFrameTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resolvedTheme, shouldAnimate]);

  // Не рендерить canvas если анимация отключена
  if (!shouldAnimate) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ 
        pointerEvents: 'none',
        willChange: 'transform', // Оптимизация для браузера
      }}
    />
  );
}

