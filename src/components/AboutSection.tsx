import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, MotionValue, useReducedMotion } from 'framer-motion';
import { WordsPullUpMultiStyle } from './Animations';

interface AnimatedLetterProps {
  char: string;
  index: number;
  totalChars: number;
  scrollYProgress: MotionValue<number>;
}

const AnimatedLetter: React.FC<AnimatedLetterProps> = ({
  char,
  index,
  totalChars,
  scrollYProgress,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const charProgress = index / totalChars;
  const opacity = useTransform(
    scrollYProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1]
  );

  if (prefersReducedMotion) {
    return <span>{char}</span>;
  }

  return (
    <motion.span style={{ opacity }} className="inline">
      {char}
    </motion.span>
  );
};

const ABOUT_BODY =
  'Seramai sebelas orang santri di bawah bimbingan Abi Hisyam direkodkan setiap hari merangkumi status Telah Menghantar, Tidak Menghantar, Sakit dan Izin beserta jumlah muka surat lama, baru serta perkembangan juzuk terkini.';

export const AboutSection: React.FC = () => {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const tokenizedWords = useMemo(() => {
    const words = ABOUT_BODY.split(' ');
    let runningIndex = 0;
    const totalChars = ABOUT_BODY.length;

    return {
      totalChars,
      words: words.map((word, wordIdx) => {
        const chars = word.split('').map((char) => {
          const idx = runningIndex++;
          return { char, idx };
        });
        const spaceIdx = wordIdx < words.length - 1 ? runningIndex++ : null;
        return { chars, spaceIdx };
      }),
    };
  }, []);

  return (
    <section id="about" className="bg-black py-16 sm:py-24 md:py-28 px-4 md:px-6">
      <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] max-w-6xl mx-auto px-6 py-16 sm:px-12 sm:py-24 md:px-16 md:py-28 text-center">
        <p className="text-primary text-[10px] sm:text-xs mb-6 sm:mb-8 tracking-wide">
          MTS Tumpat · Grub Abi Hisyam
        </p>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] mb-10 sm:mb-14 md:mb-16">
          <WordsPullUpMultiStyle
            segments={[
              {
                text: 'Halaqah Grub Abi Hisyam,',
                className: 'font-normal',
                style: { color: '#E1E0CC' },
              },
              {
                text: 'rekod hafazan MTS Tumpat.',
                className: 'italic font-serif font-normal',
                style: { color: '#E1E0CC' },
              },
              {
                text: 'Memantau hantaran harian, juzuk terkini, dan murajaah santri.',
                className: 'font-normal',
                style: { color: '#E1E0CC' },
              },
            ]}
          />
        </h2>

        <p
          ref={paragraphRef}
          className="text-[#DEDBC8] text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed"
        >
          {tokenizedWords.words.map((wordObj, wIdx) => (
            <React.Fragment key={wIdx}>
              <span className="inline-block whitespace-nowrap">
                {wordObj.chars.map((item) => (
                  <AnimatedLetter
                    key={item.idx}
                    char={item.char}
                    index={item.idx}
                    totalChars={tokenizedWords.totalChars}
                    scrollYProgress={scrollYProgress}
                  />
                ))}
              </span>
              {wordObj.spaceIdx !== null && (
                <AnimatedLetter
                  key={`space-${wordObj.spaceIdx}`}
                  char=" "
                  index={wordObj.spaceIdx}
                  totalChars={tokenizedWords.totalChars}
                  scrollYProgress={scrollYProgress}
                />
              )}
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
};
