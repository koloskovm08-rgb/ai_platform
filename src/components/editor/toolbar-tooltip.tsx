'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolbarTooltipProps {
  children: React.ReactElement;
  label: string;
  shortcut?: string;
  description?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function ToolbarTooltip({
  children,
  label,
  shortcut,
  description,
  side = 'right',
  delayDuration = 300,
}: ToolbarTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="bg-[#1F1F1F] border border-white/10 text-white shadow-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{label}</span>
              {shortcut && (
                <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/20 font-mono">
                  {shortcut}
                </kbd>
              )}
            </div>
            {description && (
              <p className="text-xs text-white/70">{description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

