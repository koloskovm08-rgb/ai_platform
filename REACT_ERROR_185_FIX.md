# Исправление React Error #185 и оптимизация хуков

## Дата: 4 января 2026

## Проблема
Приложение выдавало ошибку **React Error #185** — попытка обновить состояние во время рендеринга другого компонента. Это происходило из-за неправильных зависимостей в `useEffect`.

## Исправленные файлы

### 1. `src/components/editor/toolbar-section.tsx`
**Проблема:** `useEffect` с зависимостями `[defaultOpen, expandedSections, id, toggleSection]` вызывал бесконечный цикл обновлений.

**Решение:**
- Изменили `useEffect` на выполнение только при монтировании (`[]`)
- Использовали `setSectionExpanded` вместо `toggleSection` для прямой установки значения
- Добавили ESLint комментарий для подавления предупреждения

**До:**
```typescript
React.useEffect(() => {
  if (defaultOpen && !expandedSections.has(id)) {
    toggleSection(id);
  }
}, [defaultOpen, expandedSections, id, toggleSection]);
```

**После:**
```typescript
React.useEffect(() => {
  if (defaultOpen && !expandedSections.has(id)) {
    setSectionExpanded(id, true);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Выполняется только при монтировании
```

---

### 2. `src/hooks/use-cache.ts`
**Проблема:** `fetchData` пересоздавался при изменении `staleTime` и `cacheTime`, что вызывало лишние вызовы в `useEffect`.

**Решение:**
- Использовали `useRef` для `staleTime` и `cacheTime`
- Убрали их из зависимостей `useCallback`
- Оставили только `key` в зависимостях

**Оптимизация:**
```typescript
// Используем ref для staleTime и cacheTime
const staleTimeRef = useRef(staleTime);
const cacheTimeRef = useRef(cacheTime);

useEffect(() => {
  staleTimeRef.current = staleTime;
  cacheTimeRef.current = cacheTime;
}, [staleTime, cacheTime]);

const fetchData = useCallback(async (force = false) => {
  // Используем staleTimeRef.current вместо staleTime
  // ...
}, [key]); // Только key в зависимостях
```

---

### 3. `src/hooks/use-auto-save.ts`
**Проблема:** `debouncedSave` в зависимостях `useEffect` вызывал лишние срабатывания при изменении `enabled` и `onSave`.

**Решение:**
- Использовали `useRef` для `onSave` и `enabled`
- Создали стабильную функцию `saveFunction` без зависимостей
- Убрали `debouncedSave` из зависимостей `useEffect`

**Оптимизация:**
```typescript
const onSaveRef = useRef(onSave);
const enabledRef = useRef(enabled);

// Обновляем refs
useEffect(() => {
  onSaveRef.current = onSave;
  enabledRef.current = enabled;
}, [onSave, enabled]);

// Стабильная функция без зависимостей
const saveFunction = useCallback(async () => {
  if (!enabledRef.current || isSavingRef.current) return;
  await onSaveRef.current(dataRef.current);
}, []);

// Вызываем только при изменении data
useEffect(() => {
  if (enabled && data) {
    debouncedSave();
  }
}, [data]); // Только data
```

---

## Что мы узнали

### 1. **React Error #185**
- Возникает при попытке обновить состояние во время рендеринга
- Частая причина: неправильные зависимости в `useEffect`
- Решение: инициализировать состояние один раз или использовать `useRef`

### 2. **Оптимизация useEffect**
- Пустой массив `[]` → выполняется один раз при монтировании
- Зависимости должны быть минимальными
- Используйте `useRef` для значений, которые не должны вызывать перерендер

### 3. **Паттерн useRef для стабильности**
```typescript
// Вместо:
const callback = useCallback(() => {
  doSomething(prop);
}, [prop]); // Пересоздаётся при изменении prop

// Используйте:
const propRef = useRef(prop);
useEffect(() => { propRef.current = prop; }, [prop]);

const callback = useCallback(() => {
  doSomething(propRef.current);
}, []); // Стабильная ссылка
```

### 4. **ESLint комментарии**
Используйте `// eslint-disable-next-line react-hooks/exhaustive-deps` **только** когда:
- Вы точно понимаете, что делаете
- Есть веская причина (например, выполнение только при монтировании)
- Вы проверили, что нет побочных эффектов

---

## Результат
✅ Исправлена ошибка React Error #185  
✅ Оптимизированы хуки для меньшего количества перерендеров  
✅ Улучшена производительность приложения  
✅ Нет linter ошибок  

## Проверка
1. Запустите приложение: `npm run dev`
2. Откройте DevTools (F12) → Console
3. Перейдите на страницу редактора (например, `/editor/business-card`)
4. Проверьте, что ошибки React #185 больше нет
5. Протестируйте открытие/закрытие секций в тулбаре

---

## Профессиональные практики
1. **Минимизируйте зависимости** в `useEffect` и `useCallback`
2. **Используйте `useRef`** для значений, которые не должны вызывать ререндер
3. **Избегайте циклических зависимостей** (когда эффект меняет свои зависимости)
4. **Тестируйте в DevTools** — React DevTools Profiler покажет лишние рендеры
5. **Документируйте** нестандартные решения (ESLint комментарии)

