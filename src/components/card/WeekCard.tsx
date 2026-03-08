'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '@/stores/ui-store';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { X } from 'lucide-react';

interface WeekCardProps {
  weekNumber: number;
}

export function WeekCard({ weekNumber }: WeekCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClose = useCallback(() => {
    useUIStore.getState().setSelectedWeekNumber(null);
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === 'Escape') {
        handleClose();
      } else if ((e.key === ' ' || e.key === 'Enter') && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, handleFlip]);

  return (
    <motion.div
      key="week-card-overlay"
      className="fixed inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 shadow-md transition-colors"
        aria-label="Close card"
      >
        <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
      </button>

      {/* Card with flip animation */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-50 max-w-md w-full mx-4"
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 30 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full min-h-[400px] cursor-pointer"
          onClick={handleFlip}
        >
          {/* Front face */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden"
          >
            <CardFront weekNumber={weekNumber} />
          </div>

          {/* Back face — stop clicks from triggering flip */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardBack weekNumber={weekNumber} onFlip={handleFlip} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
