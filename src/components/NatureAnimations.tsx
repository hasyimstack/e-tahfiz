import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const AnimatedTreeEmblem: React.FC<{ variant: 0 | 1 | 2 }> = ({
  variant,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b from-[#9FE2FC] via-[#D8F6EA] to-[#ACE8B0] border border-[#DEDBC8]/40 flex items-center justify-center overflow-hidden relative shadow-md"
      style={{ perspective: '240px' }}
    >
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                rotateY: [-10, 10, -10],
                rotateX: [3, -3, 3],
              }
        }
        transition={{
          duration: 5.2 + variant * 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-10 h-10 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-sm">
          <defs>
            <radialGradient id={`sun3d-${variant}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF7AE" />
              <stop offset="100%" stopColor="#FFB703" />
            </radialGradient>
            <radialGradient id={`leafLight-${variant}`} cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#A9F0C5" />
              <stop offset="55%" stopColor="#52B788" />
              <stop offset="100%" stopColor="#2B7A50" />
            </radialGradient>
            <radialGradient id={`leafMid-${variant}`} cx="30%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#86E3AE" />
              <stop offset="60%" stopColor="#3B9B68" />
              <stop offset="100%" stopColor="#1F603D" />
            </radialGradient>
            <linearGradient id={`trunk3d-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A57B59" />
              <stop offset="55%" stopColor="#7F5A40" />
              <stop offset="100%" stopColor="#593D2A" />
            </linearGradient>
          </defs>

          {/* 3D Sun */}
          <circle cx="37" cy="10" r="4.8" fill={`url(#sun3d-${variant})`} />

          {/* Ground Contact Shadow */}
          <ellipse cx="24" cy="42.5" rx="12" ry="2.6" fill="rgba(26, 77, 46, 0.24)" />

          {variant === 0 && (
            <>
              <path
                d="M24 41.5 V25 M24 30 L17 24 M24 28 L31 23"
                stroke={`url(#trunk3d-${variant})`}
                strokeWidth="3.4"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16.5" cy="21" r="7.8" fill={`url(#leafMid-${variant})`} />
              <circle cx="31.5" cy="21" r="7.8" fill={`url(#leafMid-${variant})`} />
              <circle cx="24" cy="14" r="9" fill={`url(#leafLight-${variant})`} />
              <circle cx="20.5" cy="13.5" r="2.2" fill="#FFE066" />
              <circle cx="28.5" cy="19" r="2" fill="#FF8FA3" />
            </>
          )}

          {variant === 1 && (
            <>
              <path
                d="M17 41.5 V26 M31 41.5 V28"
                stroke={`url(#trunk3d-${variant})`}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <ellipse cx="17" cy="20" rx="7" ry="9.5" fill={`url(#leafLight-${variant})`} />
              <ellipse cx="31" cy="22" rx="6.5" ry="8.5" fill={`url(#leafMid-${variant})`} />
              <circle cx="24" cy="14.5" r="6.5" fill={`url(#leafLight-${variant})`} />
              <circle cx="16.5" cy="16" r="2" fill="#FFFDF5" />
              <circle cx="31.5" cy="19.5" r="2" fill="#FFE066" />
            </>
          )}

          {variant === 2 && (
            <>
              <path
                d="M24 41.5 V24 C24 20 20 18 16.5 16 M24 24 C26.5 20 29 18 31.5 16"
                stroke={`url(#trunk3d-${variant})`}
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16" cy="19" r="6.6" fill={`url(#leafMid-${variant})`} />
              <circle cx="32" cy="19" r="6.6" fill={`url(#leafMid-${variant})`} />
              <circle cx="24" cy="13.5" r="8.2" fill={`url(#leafLight-${variant})`} />
              <circle cx="25.5" cy="12" r="2.3" fill="#FF8FA3" />
              <circle cx="15.5" cy="17.5" r="1.9" fill="#FFE066" />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
