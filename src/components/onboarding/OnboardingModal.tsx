'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { saveSetting } from '@/lib/api';
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

    await saveSetting('birthDate', birthDateStr);
    await saveSetting('startWeekNumber', 1);

    // Show revelation
    setStep('revelation');

    // After pause for emotional weight, complete onboarding
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F5] dark:bg-[#1A1A1A]">
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
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl italic text-[#1A1A1A] dark:text-[#E8E6E3]">
                Your life in weeks
              </h1>
              <p className="font-[family-name:var(--font-serif)] text-sm sm:text-base text-[#6B6B6B] dark:text-stone-400 leading-relaxed">
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
                className="w-full px-4 py-3 rounded-lg border border-[#E8E5E0] dark:border-stone-700 bg-white dark:bg-[#242424] text-[#1A1A1A] dark:text-stone-300 text-center text-base focus:outline-none focus:ring-2 focus:ring-[#DCD0C0] dark:focus:ring-stone-600"
              />
            </div>

            <button
              onClick={handleBegin}
              disabled={!birthDateStr}
              className="px-8 py-3 rounded-lg bg-[#1A1A1A] dark:bg-[#E8E6E3] text-[#FAF8F5] dark:text-[#1A1A1A] text-sm font-medium tracking-wide hover:bg-[#333] dark:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl italic text-[#6B6B6B] dark:text-stone-300"
            >
              You&apos;ve lived{' '}
              <span className="font-normal text-[#1A1A1A] dark:text-[#E8E6E3] not-italic">
                {weeksLived.toLocaleString()}
              </span>{' '}
              weeks.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl italic text-[#6B6B6B] dark:text-stone-300"
            >
              You have roughly{' '}
              <span className="font-normal text-[#1A1A1A] dark:text-[#E8E6E3] not-italic">
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
