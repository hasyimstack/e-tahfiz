import React, { useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { WordsPullUpMultiStyle } from './Animations';
import { AnimatedTreeEmblem } from './NatureAnimations';
import { ShadyTree3D } from './ShadyTree3D';
import {
  PERIOD_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  StatusCode,
  TahfizDataset,
  countStatuses,
  formatLongDate,
  formatShortDate,
  getCurrentJuzuk,
  getDetailText,
  getLatestRecordKey,
  getWindowKeys,
} from '../data/tahfizData';

export type AnalyticsTab = 'comparison' | 'charts' | 'records';

interface FeaturesSectionProps {
  dataset: TahfizDataset;
  selectedIdx: number;
  onSelectSantri: (idx: number) => void;
  period: number;
  onChangePeriod: (per: number) => void;
  activeTab: AnalyticsTab;
  onChangeTab: (tab: AnalyticsTab) => void;
  onOpenUstaz: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  dataset,
  selectedIdx,
  onSelectSantri,
  period,
  onChangePeriod,
  activeTab,
  onChangeTab,
  onOpenUstaz,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  const santri = dataset.santri[selectedIdx] || dataset.santri[0];

  // Anchor window to today or latest record date if today is beyond the dataset
  const anchorDate = useMemo(() => {
    const allDates = dataset.santri.flatMap((s) => Object.keys(s.l || {}));
    const maxDataDate = allDates.sort().pop();
    const today = new Date().toISOString().slice(0, 10);
    if (!maxDataDate) return today;
    return today > maxDataDate ? today : maxDataDate;
  }, [dataset]);

  const windowKeys = useMemo(
    () => getWindowKeys(period, anchorDate),
    [period, anchorDate]
  );

  const counts = useMemo(
    () => countStatuses(santri, windowKeys),
    [santri, windowKeys]
  );

  const totalRecorded = counts.H + counts.T + counts.S + counts.I;
  const deliveryRate = totalRecorded
    ? Math.round((counts.H * 100) / totalRecorded)
    : null;

  const periodText =
    period === 1 ? 'hari ini' : `${PERIOD_LABELS[period]} terakhir`;

  const currentJuzuk = getCurrentJuzuk(santri);
  const latestKey = getLatestRecordKey(santri, anchorDate);
  const latestStatus = latestKey ? santri.l[latestKey] : null;

  const recordedKeysDesc = useMemo(() => {
    const minKey = windowKeys[0];
    return Object.keys(santri.l || {})
      .filter((k) => k >= minKey && k <= anchorDate)
      .sort()
      .reverse();
  }, [santri, windowKeys, anchorDate]);

  const groupTotals = useMemo(() => {
    const tot: Record<StatusCode, number> = { H: 0, T: 0, S: 0, I: 0 };
    dataset.santri.forEach((s) => {
      const c = countStatuses(s, windowKeys);
      (['H', 'T', 'S', 'I'] as StatusCode[]).forEach((k) => {
        tot[k] += c[k];
      });
    });
    return tot;
  }, [dataset, windowKeys]);

  const activeStudentsCount = useMemo(
    () => dataset.santri.filter((s) => Object.keys(s.l || {}).length > 0).length,
    [dataset]
  );

  const trendBuckets = useMemo(() => {
    if (period === 1) return [];
    const sz = period <= 7 ? 1 : period <= 90 ? 7 : 30;
    const buckets: {
      counts: Record<StatusCode, number>;
      n: number;
      label: string;
    }[] = [];
    for (let i = 0; i < windowKeys.length; i += sz) {
      const chunk = windowKeys.slice(i, i + sz);
      const c = countStatuses(santri, chunk);
      const label =
        period <= 7
          ? new Date(`${chunk[0]}T00:00:00`).toLocaleDateString('ms-MY', {
              weekday: 'short',
            })
          : `${chunk[0].slice(8)}/${chunk[0].slice(5, 7)}`;
      buckets.push({ counts: c, n: chunk.length, label });
    }
    return buckets;
  }, [santri, windowKeys, period]);

  const updatedLabel = useMemo(() => {
    try {
      return new Date(dataset.updated).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dataset.updated;
    }
  }, [dataset.updated]);

  const jumpToTab = (tab: AnalyticsTab) => {
    onChangeTab(tab);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Donut geometry
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let runningOffset = 0;

  return (
    <section
      id="features"
      className="relative min-h-screen bg-black py-16 sm:py-24 md:py-28 px-4 md:px-6 overflow-hidden flex flex-col justify-center"
    >
      {/* Subtle Noise Background */}
      <div
        className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight">
            <WordsPullUpMultiStyle
              justify="start"
              segments={[
                {
                  text: 'Rekod hafazan harian untuk santri & wali.',
                  style: { color: '#E1E0CC' },
                },
              ]}
            />
            <span className="block mt-1">
              <WordsPullUpMultiStyle
                justify="start"
                segments={[
                  {
                    text: `Kemas kini terakhir: ${updatedLabel}.`,
                    className: 'text-gray-500',
                  },
                ]}
              />
            </span>
          </h2>
        </div>

        {/* Pelajar & Tempoh Controls */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="santri-select" className="sr-only">
              Pilih pelajar
            </label>
            <select
              id="santri-select"
              value={selectedIdx}
              onChange={(e) => onSelectSantri(Number(e.target.value))}
              className="w-full rounded-xl bg-[#161616] border border-[#DEDBC8]/15 px-4 py-2.5 text-xs sm:text-sm text-[#E1E0CC] focus:outline-none focus:border-[#DEDBC8]/50 cursor-pointer"
            >
              {dataset.santri.map((item, idx) => (
                <option key={`${item.n}-${idx}`} value={idx} className="bg-[#161616]">
                  {item.hafiz ? '★ ' : ''}
                  {item.n} · Juzuk {getCurrentJuzuk(item)}
                </option>
              ))}
            </select>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Tempoh rekod"
          >
            {[1, 7, 30, 90, 180, 365].map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePeriod(p)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                    active
                      ? 'bg-primary text-black'
                      : 'bg-[#161616] text-gray-400 hover:text-[#E1E0CC]'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-Column Card Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:h-[480px] gap-3 sm:gap-2 md:gap-1"
        >
          {/* Card 1: Animated Lush Shady Tree Card with Active Santri Summary */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95 }
            }
            animate={isInView ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: 0.75,
              delay: 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative rounded-2xl overflow-hidden bg-[#C9F2DE] min-h-[360px] lg:h-full"
          >
            <ShadyTree3D />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#102A1C]/90 via-[#102A1C]/35 to-transparent pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-7">
              <div className="flex items-center justify-between text-xs text-[#102A1C] font-medium">
                <span>Juzuk terkini: {currentJuzuk}</span>
                {latestKey && latestStatus && (
                  <span className="tabular-nums">{formatShortDate(latestKey)}</span>
                )}
              </div>

              <div>
                {latestStatus && (
                  <p className="text-xs text-primary mb-2">
                    {STATUS_LABELS[latestStatus]}
                  </p>
                )}
                <p
                  className="text-lg sm:text-xl font-normal tracking-tight leading-snug"
                  style={{ color: '#E1E0CC' }}
                >
                  {santri.n}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 (01): Ringkasan Status */}
          <motion.article
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95 }
            }
            animate={isInView ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: 0.75,
              delay: prefersReducedMotion ? 0 : 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-[#212121] rounded-2xl p-6 sm:p-7 flex flex-col justify-between min-h-[360px] lg:h-full"
          >
            <div>
              <div className="mb-6 sm:mb-8">
                <AnimatedTreeEmblem variant={0} />
              </div>

              <div className="flex items-baseline justify-between gap-3 mb-5">
                <h3
                  className="text-lg sm:text-xl font-normal tracking-tight"
                  style={{ color: '#E1E0CC' }}
                >
                  Ringkasan Status.
                </h3>
                <span className="text-xs text-gray-500 tabular-nums shrink-0">
                  01
                </span>
              </div>

              <ul className="space-y-3">
                {(['H', 'T', 'S', 'I'] as StatusCode[]).map((code) => (
                  <li key={code} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5">
                      <Check
                        className="w-4 h-4 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-xs sm:text-sm text-gray-400">
                        {STATUS_LABELS[code]}
                      </span>
                    </span>
                    <span
                      className="text-xs sm:text-sm tabular-nums font-medium"
                      style={{ color: '#E1E0CC' }}
                    >
                      {counts[code]}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-gray-500 tabular-nums">
                {deliveryRate !== null
                  ? `${deliveryRate}% menghantar daripada ${totalRecorded} hari direkodkan`
                  : 'Tiada rekod pada tempoh ini'}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => jumpToTab('charts')}
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-normal transition-opacity duration-200 hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DEDBC8] rounded py-1"
                style={{ color: '#E1E0CC' }}
              >
                <span>Lihat graf trend</span>
                <ArrowRight
                  className="w-4 h-4 -rotate-45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </motion.article>

          {/* Card 3 (02): Rekod Terkini */}
          <motion.article
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95 }
            }
            animate={isInView ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: 0.75,
              delay: prefersReducedMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-[#212121] rounded-2xl p-6 sm:p-7 flex flex-col justify-between min-h-[360px] lg:h-full"
          >
            <div>
              <div className="mb-6 sm:mb-8">
                <AnimatedTreeEmblem variant={1} />
              </div>

              <div className="flex items-baseline justify-between gap-3 mb-5">
                <h3
                  className="text-lg sm:text-xl font-normal tracking-tight"
                  style={{ color: '#E1E0CC' }}
                >
                  Rekod Terkini.
                </h3>
                <span className="text-xs text-gray-500 tabular-nums shrink-0">
                  02
                </span>
              </div>

              {recordedKeysDesc.length > 0 ? (
                <ul className="space-y-3">
                  {recordedKeysDesc.slice(0, 3).map((k) => {
                    const detail = getDetailText(santri, k);
                    const status = santri.l[k];
                    return (
                      <li key={k} className="flex items-start gap-2.5">
                        <Check
                          className="w-4 h-4 text-primary shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="text-xs sm:text-sm text-gray-400 leading-snug">
                          <span style={{ color: '#E1E0CC' }}>
                            {formatShortDate(k)}
                          </span>{' '}
                          · {STATUS_LABELS[status]}
                          {detail ? (
                            <span className="block text-xs text-gray-500 mt-0.5">
                              {detail}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Tiada rekod hantaran untuk pelajar ini pada {periodText}.
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => jumpToTab('records')}
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-normal transition-opacity duration-200 hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DEDBC8] rounded py-1"
                style={{ color: '#E1E0CC' }}
              >
                <span>Semua rekod harian</span>
                <ArrowRight
                  className="w-4 h-4 -rotate-45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </motion.article>

          {/* Card 4 (03): Grub Abi Hisyam */}
          <motion.article
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95 }
            }
            animate={isInView ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: 0.75,
              delay: prefersReducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-[#212121] rounded-2xl p-6 sm:p-7 flex flex-col justify-between min-h-[360px] lg:h-full"
          >
            <div>
              <div className="mb-6 sm:mb-8">
                <AnimatedTreeEmblem variant={2} />
              </div>

              <div className="flex items-baseline justify-between gap-3 mb-5">
                <h3
                  className="text-lg sm:text-xl font-normal tracking-tight"
                  style={{ color: '#E1E0CC' }}
                >
                  Grub Abi Hisyam.
                </h3>
                <span className="text-xs text-gray-500 tabular-nums shrink-0">
                  03
                </span>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <Check
                    className="w-4 h-4 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-xs sm:text-sm text-gray-400 leading-snug tabular-nums">
                    {activeStudentsCount} daripada {dataset.santri.length} santri mempunyai rekod aktif
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check
                    className="w-4 h-4 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-xs sm:text-sm text-gray-400 leading-snug tabular-nums">
                    {groupTotals.H} hantaran berjaya dalam {periodText}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check
                    className="w-4 h-4 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-xs sm:text-sm text-gray-400 leading-snug tabular-nums">
                    {groupTotals.T} tidak hantar · {groupTotals.S} sakit · {groupTotals.I} izin
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => jumpToTab('comparison')}
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-normal transition-opacity duration-200 hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DEDBC8] rounded py-1"
                style={{ color: '#E1E0CC' }}
              >
                <span>Perbandingan pelajar</span>
                <ArrowRight
                  className="w-4 h-4 -rotate-45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </motion.article>
        </div>

        {/* Integrated Analytics & Records Workspace */}
        <div
          ref={panelRef}
          className="mt-8 sm:mt-10 bg-[#101010] rounded-2xl border border-[#DEDBC8]/10 p-5 sm:p-8"
        >
          {/* Tab Switcher + Mod Ustaz */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#DEDBC8]/10">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist">
              {(
                [
                  { id: 'comparison', label: `Perbandingan Pelajar (${dataset.santri.length})` },
                  { id: 'charts', label: 'Kalendar & Graf' },
                  { id: 'records', label: `Rekod Harian (${recordedKeysDesc.length})` },
                ] as { id: AnalyticsTab; label: string }[]
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onChangeTab(tab.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-black'
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-[#E1E0CC]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onOpenUstaz}
              className="px-3.5 py-2 rounded-lg bg-[#212121] border border-[#DEDBC8]/15 text-xs text-primary hover:bg-[#2a2a2a] transition-colors cursor-pointer whitespace-nowrap"
            >
              Mod Ustaz · Kemas kini rekod
            </button>
          </div>

          {/* Tab Content: Comparison of All 11 Santri */}
          {activeTab === 'comparison' && (
            <div className="pt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['H', 'T', 'S', 'I'] as StatusCode[]).map((code) => (
                  <div
                    key={code}
                    className="rounded-xl bg-[#181818] p-4 border border-[#DEDBC8]/5"
                  >
                    <p
                      className="text-2xl sm:text-3xl font-normal tabular-nums"
                      style={{ color: '#E1E0CC' }}
                    >
                      {groupTotals[code]}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-xs inline-block shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[code] }}
                        aria-hidden="true"
                      />
                      <span>{STATUS_LABELS[code]}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-3">
                  Ketik nama pelajar untuk membuka statistik dan rekod harian terperinci · {periodText}
                </p>

                {dataset.santri.map((student, idx) => {
                  const c = countStatuses(student, windowKeys);
                  const total = c.H + c.T + c.S + c.I;
                  const pct = total ? `${Math.round((c.H * 100) / total)}%` : '–';
                  const isSelected = idx === selectedIdx;

                  return (
                    <button
                      key={`${student.n}-${idx}`}
                      type="button"
                      onClick={() => onSelectSantri(idx)}
                      className={`w-full text-left rounded-xl p-3.5 sm:p-4 transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#212121] border-[#DEDBC8]/35'
                          : 'bg-[#161616] border-transparent hover:bg-[#1c1c1c]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <span
                          className="text-xs sm:text-sm font-normal"
                          style={{ color: '#E1E0CC' }}
                        >
                          {student.hafiz ? '★ Hafiz · ' : ''}
                          {student.n}
                        </span>
                        <span className="text-xs text-gray-400 tabular-nums shrink-0">
                          {pct} · Juzuk {getCurrentJuzuk(student)}
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-[#2a2a2a] overflow-hidden flex">
                        {total > 0 &&
                          (['H', 'S', 'I', 'T'] as StatusCode[]).map((code) => {
                            const widthPct = (c[code] * 100) / total;
                            if (widthPct <= 0) return null;
                            return (
                              <span
                                key={code}
                                style={{
                                  width: `${widthPct}%`,
                                  backgroundColor: STATUS_COLORS[code],
                                }}
                                title={`${STATUS_LABELS[code]}: ${c[code]}`}
                              />
                            );
                          })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: Calendar Heatmap + Donut + Trend Chart */}
          {activeTab === 'charts' && (
            <div className="pt-6 space-y-8">
              {period > 1 && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3
                      className="text-sm sm:text-base font-normal"
                      style={{ color: '#E1E0CC' }}
                    >
                      Kalendar hantaran · {santri.n}
                    </h3>
                    <span className="text-xs text-gray-500">{periodText}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {windowKeys.map((k) => {
                      const st = santri.l[k];
                      return (
                        <div
                          key={k}
                          title={`${formatShortDate(k)} · ${
                            st ? STATUS_LABELS[st] : 'tiada rekod'
                          }`}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-xs transition-transform hover:scale-110"
                          style={{
                            backgroundColor: st ? STATUS_COLORS[st] : '#262626',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Donut Chart */}
                <div className="md:col-span-4 flex flex-col items-center justify-center rounded-xl bg-[#161616] p-6">
                  <svg
                    viewBox="0 0 140 140"
                    width="140"
                    height="140"
                    role="img"
                    aria-label="Komposisi status hantaran"
                  >
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#2a2a2a"
                      strokeWidth="18"
                    />
                    {totalRecorded > 0 &&
                      (['H', 'T', 'S', 'I'] as StatusCode[]).map((code) => {
                        const segLen = (counts[code] / totalRecorded) * circumference;
                        if (segLen <= 0) return null;
                        const el = (
                          <circle
                            key={code}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke={STATUS_COLORS[code]}
                            strokeWidth="18"
                            strokeDasharray={`${segLen} ${circumference - segLen}`}
                            strokeDashoffset={-runningOffset}
                            transform="rotate(-90 70 70)"
                          />
                        );
                        runningOffset += segLen;
                        return el;
                      })}
                    <text
                      x="70"
                      y="68"
                      textAnchor="middle"
                      fontSize="22"
                      fontWeight="700"
                      fill="#E1E0CC"
                    >
                      {deliveryRate !== null ? `${deliveryRate}%` : '–'}
                    </text>
                    <text
                      x="70"
                      y="86"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#9ca3af"
                    >
                      menghantar
                    </text>
                  </svg>
                </div>

                {/* Trend Stacked Bar Chart */}
                <div className="md:col-span-8 rounded-xl bg-[#161616] p-6">
                  <p className="text-xs text-gray-400 mb-3">
                    {period === 1
                      ? 'Pilih tempoh lebih panjang untuk melihat graf trend.'
                      : `Trend ${
                          period <= 7 ? 'harian' : period <= 90 ? 'mingguan' : 'bulanan'
                        }`}
                  </p>
                  {period > 1 && trendBuckets.length > 0 && (
                    <svg
                      viewBox="0 0 640 200"
                      className="w-full h-auto"
                      role="img"
                      aria-label="Graf trend hantaran"
                    >
                      {[0, 0.5, 1].map((f) => {
                        const y = 10 + 170 * (1 - f);
                        return (
                          <line
                            key={f}
                            x1="10"
                            x2="630"
                            y1={y}
                            y2={y}
                            stroke="#2a2a2a"
                            strokeWidth="1"
                          />
                        );
                      })}
                      {trendBuckets.map((bucket, idx) => {
                        const gap = 620 / trendBuckets.length;
                        const bw = Math.min(52, gap * 0.65);
                        const x = 10 + idx * gap + (gap - bw) / 2;
                        let y = 180;
                        return (
                          <g key={idx}>
                            {(['H', 'S', 'I', 'T'] as StatusCode[]).map((code) => {
                              const h = (170 * bucket.counts[code]) / bucket.n;
                              if (h <= 0) return null;
                              y -= h;
                              return (
                                <rect
                                  key={code}
                                  x={x}
                                  y={y}
                                  width={bw}
                                  height={h}
                                  rx="3"
                                  fill={STATUS_COLORS[code]}
                                />
                              );
                            })}
                            <text
                              x={x + bw / 2}
                              y="196"
                              textAnchor="middle"
                              fontSize="11"
                              fill="#9ca3af"
                            >
                              {bucket.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-gray-400">
                {(['H', 'T', 'S', 'I'] as StatusCode[]).map((code) => (
                  <span key={code} className="inline-flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs inline-block"
                      style={{ backgroundColor: STATUS_COLORS[code] }}
                      aria-hidden="true"
                    />
                    <span>{STATUS_LABELS[code]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Full Daily Log for Selected Santri */}
          {activeTab === 'records' && (
            <div className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3
                  className="text-sm sm:text-base font-normal"
                  style={{ color: '#E1E0CC' }}
                >
                  Rekod harian · {santri.n}
                </h3>
                <span className="text-xs text-gray-500">{periodText}</span>
              </div>

              {recordedKeysDesc.length > 0 ? (
                <div className="divide-y divide-[#DEDBC8]/10">
                  {recordedKeysDesc.map((k) => {
                    const status = santri.l[k];
                    const detail = getDetailText(santri, k);
                    return (
                      <div
                        key={k}
                        className="py-3.5 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs sm:text-sm" style={{ color: '#E1E0CC' }}>
                            {formatLongDate(k)}
                          </p>
                          {detail && (
                            <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
                              {detail}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-2 text-xs text-gray-300">
                          <span
                            className="w-2 h-2 rounded-xs inline-block"
                            style={{ backgroundColor: STATUS_COLORS[status] }}
                            aria-hidden="true"
                          />
                          <span>{STATUS_LABELS[status]}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-400 py-6">
                  Tiada rekod pada tempoh ini untuk {santri.n}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
