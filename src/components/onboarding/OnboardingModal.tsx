'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/db';
import { getWeeksLived } from '@/lib/week-utils';

const TOTAL_LIFE_WEEKS = 4000;

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<'input' | 'revelation'>('input');
  const [birthDateStr, setBirthDateStr] = useState('');
  const [weeksLived, setWeeksLived] = useState(0);
  const [weeksRemaining, setWeeksRemaining] = useState(0);

  const handleBegin = async () => {
    if (!birthDateStr) return;

    const birthDate = new Date(birthDateStr + 'T00:00:00');
    const lived = getWeeksLived(birthDate);
    const remaining = Math.max(0, TOTAL_LIFE_WEEKS - lived);

    setWeeksLived(lived);
    setWeeksRemaining(remaining);

    // Save birth date to Dexie settings
    const now = new Date().toISOString();
    await db.settings.put({ key: 'birthDate', value: birthDateStr, updatedAt: now });
    await db.settings.put({ key: 'startWeekNumber', value: 1, updatedAt: now });

    // Show revelation
    setStep('revelation');

    // After pause for emotional weight, complete onboarding
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 px-6 max-w-md text-center"
          >
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-700 dark:text-stone-300">
                Your life in weeks
              </h1>
              <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 leading-relaxed">
                From age 18 to 95, life is roughly 4,000 weeks.
                <br />
                Each one deserves to be remembered.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <label
                htmlFor="birth-date"
                className="text-sm text-stone-600 dark:text-stone-400"
              >
                When were you born?
              </label>
              <input
                id="birth-date"
                type="date"
                value={birthDateStr}
                onChange={(e) => setBirthDateStr(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-center text-base focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600"
              />
            </div>

            <button
              onClick={handleBegin}
              disabled={!birthDateStr}
              className="px-8 py-3 rounded-lg bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 text-sm font-medium tracking-wide hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              See my weeks
            </button>
          </motion.div>
        )}

        {step === 'revelation' && (
          <motion.div
            key="revelation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 px-6 max-w-md text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl font-light text-stone-700 dark:text-stone-300"
            >
              You&apos;ve lived{' '}
              <span className="font-normal text-stone-900 dark:text-stone-100">
                {weeksLived.toLocaleString()}
              </span>{' '}
              weeks.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-4xl sm:text-5xl font-light text-stone-700 dark:text-stone-300"
            >
              You have roughly{' '}
              <span className="font-normal text-stone-900 dark:text-stone-100">
                {weeksRemaining.toLocaleString()}
              </span>{' '}
              left.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
