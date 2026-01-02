'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ToolbarTooltip } from './toolbar-tooltip';
import { useEditorToolbarStore } from '@/stores/editor-toolbar-store';

interface ToolbarToolProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  shortcut?: string;
  description?: string;
  isActive?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  badge?: string;
  className?: string;
}

export function ToolbarTool({
  id,
  label,
  icon,
  onClick,
  shortcut,
  description,
  isActive = false,
  disabled = false,
  variant = 'default',
  badge,
  className,
}: ToolbarToolProps) {
  const { activeTool, setActiveTool } = useEditorToolbarStore();

  const handleClick = () => {
    if (disabled) return;
    setActiveTool(id);
    onClick();
  };

  const isToolActive = isActive || activeTool === id;

  const variantStyles = {
    default: 'bg-white/5 hover:bg-white/10 text-white/90',
    primary: 'bg-primary/20 hover:bg-primary/30 text-primary',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
  };

  return (
    <ToolbarTooltip
      label={label}
      shortcut={shortcut}
      description={description}
      side="right"
    >
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-md',
          'text-sm font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          variantStyles[variant],
          isToolActive && 'ring-2 ring-primary/50 bg-primary/10',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <span className={cn('flex-shrink-0', isToolActive && 'text-primary')}>
          {icon}
        </span>
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-xs bg-primary/20 rounded border border-primary/30">
            {badge}
          </span>
        )}
      </motion.button>
    </ToolbarTooltip>
  );
}

