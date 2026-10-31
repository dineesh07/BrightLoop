'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
  toggle: () => void;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

export function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  const toggle = () => setOpen(!open);

  return (
    <PopoverContext.Provider
      value={{ open, setOpen, triggerRect, setTriggerRect, toggle }}
    >
      <div className="relative inline-flex items-center">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(PopoverContext);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!context) return;
    if (triggerRef.current) {
      context.setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    context.toggle();
  };

  return (
    <div ref={triggerRef} onClick={handleClick} className={className}>
      {children}
    </div>
  );
}

export function PopoverContent({
  children,
  sideOffset = 10,
  className = '',
}: {
  children: React.ReactNode;
  sideOffset?: number;
  className?: string;
}) {
  const context = useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Click outside and Escape key to close
  useEffect(() => {
    if (!context?.open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        context.setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        context.setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [context]);

  if (!context?.open || !context.triggerRect || !mounted) return null;

  const { left, width, bottom } = context.triggerRect;

  // Position to the right of the trigger, aligned with bottom
  const style: React.CSSProperties = {
    position: 'fixed',
    left: left + width + sideOffset,
    bottom: Math.max(16, window.innerHeight - bottom),
    zIndex: 9999,
    transformOrigin: 'bottom left',
  };

  return createPortal(
    <div
      ref={contentRef}
      style={style}
      className={`rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl transition-all duration-150 ease-out animate-in fade-in-0 zoom-in-95 ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}
