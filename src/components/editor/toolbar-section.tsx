'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorToolbarStore } from '@/stores/editor-toolbar-store';
import type { ToolbarSectionId } from '@/stores/editor-toolbar-store';

interface ToolbarSectionProps {
  id: ToolbarSectionId;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function ToolbarSection({
  id,
  title,
  icon,
  children,
  defaultOpen = true,
  className,
}: ToolbarSectionProps) {
  const { expandedSections, toggleSection } = useEditorToolbarStore();
  const isExpanded = expandedSections.has(id);

  React.useEffect(() => {
    if (defaultOpen && !expandedSections.has(id)) {
      toggleSection(id);
    }
  }, [defaultOpen, expandedSections, id, toggleSection]);

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300',
        'hover:bg-white/10 hover:border-white/20',
        className
      )}
    >
      <button
        onClick={() => toggleSection(id)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          'text-sm font-medium text-white/90',
          'transition-colors duration-200',
          'hover:text-white hover:bg-white/5',
          'rounded-t-lg'
        )}
      >
        <div className="flex items-center gap-2">
          {icon && <div className="text-white/70">{icon}</div>}
          <span>{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp className="h-4 w-4 text-white/50" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 py-2 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

