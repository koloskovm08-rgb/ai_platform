'use client';

import * as React from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector элемента для подсветки
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  hasSeenOnboarding: boolean;
}

const ONBOARDING_STORAGE_KEY = 'ai-platform-onboarding';

/**
 * Хук для управления onboarding туром
 */
export function useOnboarding(steps: OnboardingStep[]) {
  const [state, setState] = React.useState<OnboardingState>({
    isActive: false,
    currentStep: 0,
    hasSeenOnboarding: false,
  });

  // Загрузка состояния из localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          hasSeenOnboarding: parsed.hasSeenOnboarding || false,
        }));
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    }
  }, []);

  // Сохранение в localStorage
  const saveState = React.useCallback((newState: Partial<OnboardingState>) => {
    try {
      const updated = { ...state, ...newState };
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({
          hasSeenOnboarding: updated.hasSeenOnboarding,
        })
      );
      setState(updated);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, [state]);

  // Начать тур
  const startTour = React.useCallback(() => {
    saveState({
      isActive: true,
      currentStep: 0,
    });
  }, [saveState]);

  // Следующий шаг
  const nextStep = React.useCallback(() => {
    if (state.currentStep < steps.length - 1) {
      saveState({
        currentStep: state.currentStep + 1,
      });
    } else {
      // Конец тура
      saveState({
        isActive: false,
        currentStep: 0,
        hasSeenOnboarding: true,
      });
    }
  }, [state.currentStep, steps.length, saveState]);

  // Предыдущий шаг
  const prevStep = React.useCallback(() => {
    if (state.currentStep > 0) {
      saveState({
        currentStep: state.currentStep - 1,
      });
    }
  }, [state.currentStep, saveState]);

  // Пропустить тур
  const skipTour = React.useCallback(() => {
    saveState({
      isActive: false,
      currentStep: 0,
      hasSeenOnboarding: true,
    });
  }, [saveState]);

  // Сбросить тур (для повторного прохождения)
  const resetTour = React.useCallback(() => {
    saveState({
      isActive: false,
      currentStep: 0,
      hasSeenOnboarding: false,
    });
  }, [saveState]);

  // Текущий шаг
  const currentStepData = steps[state.currentStep];

  return {
    isActive: state.isActive,
    currentStep: state.currentStep,
    currentStepData,
    totalSteps: steps.length,
    hasSeenOnboarding: state.hasSeenOnboarding,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === steps.length - 1,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    resetTour,
  };
}

