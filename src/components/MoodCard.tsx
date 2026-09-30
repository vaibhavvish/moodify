import { motion } from 'framer-motion';
import type { MoodConfig } from '../types';
import { cn } from '../utils';

interface MoodCardProps {
  mood: MoodConfig;
  isSelected: boolean;
  onSelect: (mood: MoodConfig) => void;
}

export default function MoodCard({ mood, isSelected, onSelect }: MoodCardProps) {
  return (
    <motion.button
      className={cn(
        'relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 cursor-pointer group overflow-hidden',
        isSelected
          ? 'border-white/20 scale-[1.02]'
          : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border)]'
      )}
      onClick={() => onSelect(mood)}
      whileHover={{ scale: isSelected ? 1.02 : 1.04 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Select ${mood.label} mood`}
      aria-pressed={isSelected}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
          mood.gradient,
          isSelected ? 'opacity-20' : 'group-hover:opacity-10'
        )}
      />

      {/* Glow */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ boxShadow: `0 0 40px ${mood.glowColor}, inset 0 0 40px ${mood.glowColor}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Icon */}
      <motion.span
        className="text-3xl relative z-10"
        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        {mood.icon}
      </motion.span>

      {/* Label */}
      <span className="text-sm font-medium text-[var(--color-text-primary)] relative z-10">
        {mood.label}
      </span>

      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <span className="text-[10px]">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}
