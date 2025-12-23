'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useOnboarding, type OnboardingStep } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  steps: OnboardingStep[];
  autoStart?: boolean; // Автоматически стартовать для новых пользователей
}

/**
 * Компонент onboarding тура
 * Показывает пошаговые подсказки для новых пользователей
 */
export function OnboardingTour({ steps, autoStart = true }: OnboardingTourProps) {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    hasSeenOnboarding,
    isFirstStep,
    isLastStep,
    startTour,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding(steps);

  // Автостарт для новых пользователей
  React.useEffect(() => {
    if (autoStart && !hasSeenOnboarding) {
      // Задержка 1 секунда перед показом
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasSeenOnboarding, startTour]);

  // Подсветка целевого элемента
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isActive && currentStepData?.targetSelector) {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      setTargetElement(element);

      // Прокрутка к элементу
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetElement(null);
    }
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData) {
    return null;
  }

  // Позиция карточки относительно целевого элемента
  const getCardPosition = () => {
    if (!targetElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = targetElement.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const cardStyle = getCardPosition();

  return (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        style={{ pointerEvents: 'none' }}
      />

      {/* Подсветка целевого элемента */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.offsetTop,
            left: targetElement.offsetLeft,
            width: targetElement.offsetWidth,
            height: targetElement.offsetHeight,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Карточка подсказки */}
      <Card
        className="fixed z-[60] max-w-md p-6 shadow-2xl"
        style={{
          ...cardStyle,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={skipTour}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Описание */}
        <p className="text-sm text-muted-foreground mb-6">
          {currentStepData.description}
        </p>

        {/* Действие (опционально) */}
        {currentStepData.action && (
          <Button
            onClick={currentStepData.action.onClick}
            className="w-full mb-4"
          >
            {currentStepData.action.label}
          </Button>
        )}

        {/* Навигация */}
        <div className="flex items-center justify-between">
          {/* Индикаторы */}
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                )}
              />
            ))}
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Button>
            )}
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? 'Готово' : 'Далее'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Счётчик */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          Шаг {currentStep + 1} из {totalSteps}
        </p>
      </Card>
    </>
  );
}

