/**
 * Утилиты для оптимизации React компонентов
 */

import React, { ComponentType, memo } from 'react';
import { useRenderTime, useWhyDidYouUpdate } from './performance';

/**
 * HOC для автоматической оптимизации компонента через React.memo
 * с дополнительным логированием в development
 */
export function withPerformanceOptimization<P extends object>(
  Component: ComponentType<P>,
  displayName?: string
) {
  const componentName = displayName || Component.displayName || Component.name || 'Component';

  const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
    // Глубокое сравнение пропсов
    return shallowEqual(prevProps, nextProps);
  });

  OptimizedComponent.displayName = `Optimized(${componentName})`;

  // В development добавляем мониторинг
  if (process.env.NODE_ENV === 'development') {
    const DevWrapper = (props: P) => {
      useRenderTime(componentName);
      useWhyDidYouUpdate(componentName, props as Record<string, any>);
      return <OptimizedComponent {...props} />;
    };
    DevWrapper.displayName = `DevWrapper(${componentName})`;
    return DevWrapper;
  }

  return OptimizedComponent;
}

/**
 * Поверхностное сравнение объектов
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Глубокое сравнение объектов
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      return false;
    }
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Создаёт мемоизированный компонент с кастомной функцией сравнения
 */
export function createMemoComponent<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, areEqual);
}

/**
 * HOC для ленивой загрузки компонента
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = <div>Загрузка...</div>
) {
  const LazyComponent = React.lazy(importFunc);

  const LazyWrapper = (props: P) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
  LazyWrapper.displayName = 'LazyWrapper';
  return LazyWrapper;
}

/**
 * HOC для добавления error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return class ErrorBoundaryWrapper extends React.Component<
    P,
    { hasError: boolean; error?: Error }
  > {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          fallback || (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">Произошла ошибка</h3>
              <p className="text-red-600 text-sm">
                {this.state.error?.message || 'Неизвестная ошибка'}
              </p>
            </div>
          )
        );
      }

      return <Component {...this.props} />;
    }
  };
}

/**
 * Хелпер для создания стабильных обработчиков событий
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return React.useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Хук для мемоизации сложных вычислений
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = React.useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}

/**
 * Хук для отложенного обновления значения
 */
export function useDeferredValue<T>(value: T, delay: number = 100): T {
  const [deferredValue, setDeferredValue] = React.useState(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return deferredValue;
}

/**
 * Хук для виртуализации больших списков
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

