import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface WordsPullUpProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  showAsterisk?: boolean;
}

export const WordsPullUp: React.FC<WordsPullUpProps> = ({
  text,
  className = '',
  style,
  showAsterisk = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(' ');

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, idx) => {
        const isLastWord = idx === words.length - 1;
        const shouldRenderAsterisk = showAsterisk && isLastWord && word.length > 0;

        let content: React.ReactNode = word;
        if (shouldRenderAsterisk) {
          const before = word.slice(0, -1);
          const lastChar = word.slice(-1);

          content = (
            <>
              {before}
              <span className="relative inline-block">
                {lastChar}
                <span
                  className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] leading-none font-normal select-none"
                  aria-hidden="true"
                >
                  *
                </span>
              </span>
            </>
          );
        }

        return (
          <span key={`${word}-${idx}`} className="inline-block overflow-visible mr-[0.22em] last:mr-0">
            <motion.span
              className="inline-block"
              initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : undefined}
              transition={{
                duration: 0.7,
                delay: prefersReducedMotion ? 0 : idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {content}
            </motion.span>
          </span>
        );
      })}
    </div>
  );
};

export interface WordSegment {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

interface WordsPullUpMultiStyleProps {
  segments: WordSegment[];
  className?: string;
  justify?: 'center' | 'start';
}

export const WordsPullUpMultiStyle: React.FC<WordsPullUpMultiStyleProps> = ({
  segments,
  className = '',
  justify = 'center',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();

  const words = segments.flatMap((segment) =>
    segment.text
      .split(' ')
      .filter(Boolean)
      .map((word) => ({
        word,
        className: segment.className || '',
        style: segment.style,
      }))
  );

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap ${
        justify === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
    >
      {words.map((item, idx) => (
        <span key={`${item.word}-${idx}`} className="inline-block overflow-hidden mr-[0.24em] last:mr-0 pb-[0.06em]">
          <motion.span
            className={`inline-block ${item.className}`}
            style={item.style}
            initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : undefined}
            transition={{
              duration: 0.65,
              delay: prefersReducedMotion ? 0 : idx * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </div>
  );
};
