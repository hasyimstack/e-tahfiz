import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { WordsPullUp } from './Animations';
import { FlowerGarden3D } from './FlowerGarden3D';

interface HeroSectionProps {
  onSelectNav: (target: string) => void;
}

const NAV_ITEMS = [
  { label: 'Tentang', target: 'about' },
  { label: 'Pelajar', target: 'comparison' },
  { label: 'Statistik', target: 'charts' },
  { label: 'Rekod', target: 'records' },
  { label: 'Mod Ustaz', target: 'ustaz' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectNav }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative h-screen min-h-[640px] w-full bg-black p-4 md:p-6">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#BDEAFB]">
        {/* Real-Time 3D Bright & Joyful Flower Garden */}
        <FlowerGarden3D />

        {/* Subtle Texture Overlay */}
        <div
          className="noise-overlay absolute inset-0 opacity-[0.18] mix-blend-soft-light pointer-events-none"
          aria-hidden="true"
        />

        {/* Lower Readability Scrim (keeps upper sky & garden bright and sunny) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#102918]/85 pointer-events-none"
          aria-hidden="true"
        />

        {/* Top-Center Hanging Pill Navbar */}
        <header className="absolute top-0 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100%-1.5rem)]">
          <nav
            aria-label="Navigasi Utama"
            className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8 flex items-center justify-center gap-3 sm:gap-6 md:gap-12 lg:gap-14"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectNav(item.target)}
                style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#E1E0CC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)';
                }}
                className="text-[10px] sm:text-xs md:text-sm font-normal whitespace-nowrap shrink-0 transition-colors duration-200 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DEDBC8] rounded"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Bottom-Aligned Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-8 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-8">
            {/* Left 8 Columns: Giant Display Heading */}
            <div className="lg:col-span-8">
              <h1 className="sr-only">MTS Tumpat — Rekod Hafazan Grub Abi Hisyam</h1>
              <WordsPullUp
                text="Tahfiz"
                showAsterisk
                className="text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] font-medium leading-[0.85] tracking-[-0.07em] select-none"
                style={{ color: '#E1E0CC' }}
              />
            </div>

            {/* Right 4 Columns: Portal Summary + CTA */}
            <div className="lg:col-span-4 flex flex-col items-start gap-5 md:gap-6 lg:pb-3">
              <motion.p
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: prefersReducedMotion ? 0 : 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-primary/70 text-xs sm:text-sm md:text-base max-w-md"
                style={{ lineHeight: 1.2 }}
              >
                MTS Tumpat — Rekod Hafazan Grub Abi Hisyam. Pantau hantaran harian, ulangan lama, hafazan baru dan pencapaian juzuk setiap santri secara terperinci untuk rujukan wali.
              </motion.p>

              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: prefersReducedMotion ? 0 : 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelectNav('features')}
                  className="group inline-flex items-center gap-2 hover:gap-3 bg-primary text-black font-medium text-sm sm:text-base rounded-full pl-5 pr-1.5 py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1E0CC] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <span>Semak rekod</span>
                  <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <ArrowRight
                      className="w-4 h-4"
                      style={{ color: '#E1E0CC' }}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
