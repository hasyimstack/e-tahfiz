import { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { FeaturesSection, AnalyticsTab } from './components/FeaturesSection';
import { UstazModal } from './components/UstazModal';
import { INITIAL_TAHFIZ_DATA, TahfizDataset } from './data/tahfizData';

const DRAFT_STORAGE_KEY = 'mts-tumpat-draf-v1';

function loadInitialDataset(): TahfizDataset {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.base === INITIAL_TAHFIZ_DATA.updated && parsed.data) {
        return parsed.data as TahfizDataset;
      }
    }
  } catch {
    // Ignore storage parse errors and use bundled dataset
  }
  return JSON.parse(JSON.stringify(INITIAL_TAHFIZ_DATA)) as TahfizDataset;
}

export default function App() {
  const [dataset, setDataset] = useState<TahfizDataset>(loadInitialDataset);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [period, setPeriod] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('comparison');
  const [isUstazOpen, setIsUstazOpen] = useState<boolean>(false);

  useEffect(() => {
    if (window.location.hash === '#ustaz') {
      setIsUstazOpen(true);
    }
  }, []);

  const handleUpdateDataset = (next: TahfizDataset) => {
    setDataset(next);
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ base: INITIAL_TAHFIZ_DATA.updated, data: next })
      );
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleResetDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setDataset(JSON.parse(JSON.stringify(INITIAL_TAHFIZ_DATA)) as TahfizDataset);
  };

  const handleSelectNav = (target: string) => {
    if (target === 'ustaz') {
      setIsUstazOpen(true);
      return;
    }

    if (target === 'about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target === 'comparison' || target === 'charts' || target === 'records') {
      setActiveTab(target);
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-black text-[#E1E0CC]">
      <HeroSection onSelectNav={handleSelectNav} />

      <AboutSection />

      <FeaturesSection
        dataset={dataset}
        selectedIdx={selectedIdx}
        onSelectSantri={(idx) => setSelectedIdx(idx)}
        period={period}
        onChangePeriod={(p) => setPeriod(p)}
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        onOpenUstaz={() => setIsUstazOpen(true)}
      />

      <UstazModal
        isOpen={isUstazOpen}
        onClose={() => setIsUstazOpen(false)}
        dataset={dataset}
        onUpdateDataset={handleUpdateDataset}
        onResetDraft={handleResetDraft}
      />
    </main>
  );
}
