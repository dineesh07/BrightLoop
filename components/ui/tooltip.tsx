'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
  delayDuration: number;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider({
  children,
  delayDuration = 150,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

export function Tooltip({
  children,
  delayDuration = 150,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  return (
    <TooltipContext.Provider
      value={{ open, setOpen, triggerRect, setTriggerRect, delayDuration }}
    >
      <div className="relative inline-flex items-center w-full justify-center">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TooltipContext);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (!context) return;
    if (triggerRef.current) {
      context.setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    timeoutRef.current = setTimeout(() => {
      context.setOpen(true);
    }, context.delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    context?.setOpen(false);
  };

  const handleFocus = () => {
    if (!context) return;
    if (triggerRef.current) {
      context.setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    context.setOpen(true);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    context?.setOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`w-full flex justify-center ${className}`}
    >
      {children}
    </div>
  );
}

export function TooltipContent({
  children,
  sideOffset = 8,
  className = '',
}: {
  children: React.ReactNode;
  sideOffset?: number;
  className?: string;
}) {
  const context = useContext(TooltipContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!context?.open || !context.triggerRect || !mounted) return null;

  const { top, left, width, height } = context.triggerRect;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: top + height / 2,
    left: left + width + sideOffset,
    transform: 'translateY(-50%)',
    zIndex: 9999,
  };

  return createPortal(
    <div
      role="tooltip"
      style={style}
      className={`pointer-events-none select-none rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-md transition-opacity duration-150 ease-out ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}
