import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ToolMode = 'manual' | 'ai';

export type ToolbarSectionId =
  | 'file'
  | 'history'
  | 'view'
  | 'collaboration'
  | 'transform'
  | 'text'
  | 'image'
  | 'shapes'
  | 'ai-suggestions'
  | 'export';

export interface ToolbarState {
  // Режим работы (Manual / AI Assist)
  mode: ToolMode;
  setMode: (mode: ToolMode) => void;

  // Свернутые/развернутые секции
  expandedSections: Set<ToolbarSectionId>;
  toggleSection: (sectionId: ToolbarSectionId) => void;
  setSectionExpanded: (sectionId: ToolbarSectionId, expanded: boolean) => void;

  // Избранные инструменты (для быстрого доступа)
  favoriteTools: string[];
  addFavoriteTool: (toolId: string) => void;
  removeFavoriteTool: (toolId: string) => void;

  // Настройки панели
  toolbarWidth: number;
  setToolbarWidth: (width: number) => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;

  // Активный инструмент
  activeTool: string | null;
  setActiveTool: (toolId: string | null) => void;
}

export const useEditorToolbarStore = create<ToolbarState>()(
  persist(
    (set) => ({
      // Режим работы
      mode: 'manual',
      setMode: (mode) => set({ mode }),

      // Секции
      expandedSections: new Set<ToolbarSectionId>([
        'file',
        'history',
        'transform',
        'text',
        'image',
      ]),
      toggleSection: (sectionId) =>
        set((state) => {
          const next = new Set(state.expandedSections);
          if (next.has(sectionId)) {
            next.delete(sectionId);
          } else {
            next.add(sectionId);
          }
          return { expandedSections: next };
        }),
      setSectionExpanded: (sectionId, expanded) =>
        set((state) => {
          const next = new Set(state.expandedSections);
          if (expanded) {
            next.add(sectionId);
          } else {
            next.delete(sectionId);
          }
          return { expandedSections: next };
        }),

      // Избранные инструменты
      favoriteTools: [],
      addFavoriteTool: (toolId) =>
        set((state) => ({
          favoriteTools: [...state.favoriteTools, toolId],
        })),
      removeFavoriteTool: (toolId) =>
        set((state) => ({
          favoriteTools: state.favoriteTools.filter((id) => id !== toolId),
        })),

      // Настройки панели
      toolbarWidth: 280,
      setToolbarWidth: (width) => set({ toolbarWidth: width }),
      isCollapsed: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      // Активный инструмент
      activeTool: null,
      setActiveTool: (toolId) => set({ activeTool: toolId }),
    }),
    {
      name: 'editor-toolbar-storage',
      storage: createJSONStorage(() => localStorage),
      // Сериализация Set для localStorage
      partialize: (state) => ({
        mode: state.mode,
        expandedSections: Array.from(state.expandedSections),
        favoriteTools: state.favoriteTools,
        toolbarWidth: state.toolbarWidth,
        isCollapsed: state.isCollapsed,
        activeTool: state.activeTool,
      }),
      // Десериализация Set из localStorage
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.expandedSections)) {
          state.expandedSections = new Set(state.expandedSections as ToolbarSectionId[]);
        }
      },
    }
  )
);

