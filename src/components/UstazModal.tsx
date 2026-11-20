import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, RotateCcw, Star, X } from 'lucide-react';
import {
  Santri,
  STATUS_SHORT,
  StatusCode,
  TahfizDataset,
  addDays,
  formatLongDate,
  formatShortDate,
  getTodayKey,
} from '../data/tahfizData';

interface UstazModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: TahfizDataset;
  onUpdateDataset: (next: TahfizDataset) => void;
  onResetDraft: () => void;
}

export const UstazModal: React.FC<UstazModalProps> = ({
  isOpen,
  onClose,
  dataset,
  onUpdateDataset,
  onResetDraft,
}) => {
  const [editDate, setEditDate] = useState<string>(() => {
    const today = getTodayKey();
    return today;
  });
  const [showFixedPages, setShowFixedPages] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const prevDate = useMemo(() => {
    let maxPrev = '';
    dataset.santri.forEach((s) => {
      Object.keys(s.l || {}).forEach((k) => {
        if (k < editDate && k > maxPrev) maxPrev = k;
      });
    });
    return maxPrev;
  }, [dataset, editDate]);

  const filledCount = useMemo(
    () => dataset.santri.filter((s) => Boolean(s.l[editDate])).length,
    [dataset, editDate]
  );

  const getLastJuzukBefore = (santri: Santri): number | undefined => {
    const keys = Object.keys(santri.d || {})
      .filter((k) => k < editDate && santri.d[k]?.j)
      .sort();
    if (!keys.length) return undefined;
    const detail = santri.d[keys[keys.length - 1]];
    const start = Number(detail.j) || 0;
    const count = Math.max(0, (Number(detail.n) || 1) - 1);
    return Math.min(30, start + count);
  };

  const cloneDataset = (): TahfizDataset => JSON.parse(JSON.stringify(dataset));

  const handleToggleStatus = (idx: number, code: StatusCode) => {
    const next = cloneDataset();
    const s = next.santri[idx];
    s.d = s.d || {};
    if (s.l[editDate] === code) {
      delete s.l[editDate];
      delete s.d[editDate];
    } else {
      s.l[editDate] = code;
      if (code !== 'H') {
        delete s.d[editDate];
      } else if (!s.d[editDate]) {
        const j = getLastJuzukBefore(s);
        s.d[editDate] = {
          ...(j ? { j } : {}),
          ...(s.ml ? { l: s.ml } : {}),
          ...(s.mb && !s.hafiz ? { b: s.mb } : {}),
        };
      }
    }
    onUpdateDataset(next);
  };

  const handleDetailChange = (
    idx: number,
    field: 'j' | 'n',
    rawVal: string
  ) => {
    const next = cloneDataset();
    const s = next.santri[idx];
    s.d = s.d || {};
    s.d[editDate] = s.d[editDate] || {};
    if (field === 'n' && (rawVal === '' || Number(rawVal) <= 1)) {
      delete s.d[editDate].n;
    } else if (rawVal === '') {
      delete s.d[editDate][field];
    } else {
      s.d[editDate][field] = Math.max(0, Number(rawVal));
    }
    onUpdateDataset(next);
  };

  const handleToggleHafiz = (idx: number) => {
    const next = cloneDataset();
    const s = next.santri[idx];
    s.hafiz = !s.hafiz;
    if (s.hafiz && s.d?.[editDate]) {
      delete s.d[editDate].b;
    }
    onUpdateDataset(next);
  };

  const handleNameChange = (idx: number, value: string) => {
    const next = cloneDataset();
    next.santri[idx].n = value.slice(0, 120);
    onUpdateDataset(next);
  };

  const handleFixedPageChange = (
    idx: number,
    field: 'ml' | 'mb',
    rawVal: string
  ) => {
    const next = cloneDataset();
    const s = next.santri[idx];
    const v = rawVal === '' ? undefined : Number(rawVal);
    if (v === undefined) {
      delete s[field];
    } else {
      s[field] = v;
    }
    if (s.l[editDate] === 'H' && s.d?.[editDate]) {
      const k = field === 'ml' ? 'l' : 'b';
      if (v === undefined) delete s.d[editDate][k];
      else if (!(k === 'b' && s.hafiz)) s.d[editDate][k] = v;
    }
    onUpdateDataset(next);
  };

  const handleMarkAllH = () => {
    const next = cloneDataset();
    next.santri.forEach((s) => {
      if (!s.l[editDate]) {
        s.l[editDate] = 'H';
        s.d = s.d || {};
        const j = getLastJuzukBefore(s);
        s.d[editDate] = {
          ...(j ? { j } : {}),
          ...(s.ml ? { l: s.ml } : {}),
          ...(s.mb && !s.hafiz ? { b: s.mb } : {}),
        };
      }
    });
    onUpdateDataset(next);
  };

  const handleCopyPrev = () => {
    if (!prevDate) return;
    const next = cloneDataset();
    next.santri.forEach((s) => {
      if (!s.l[editDate] && s.l[prevDate]) {
        s.l[editDate] = s.l[prevDate];
        s.d = s.d || {};
        if (s.l[prevDate] === 'H' && s.d[prevDate]) {
          const cloned = { ...s.d[prevDate] };
          if (s.ml) cloned.l = s.ml;
          if (s.mb && !s.hafiz) cloned.b = s.mb;
          if (s.hafiz) delete cloned.b;
          s.d[editDate] = cloned;
        }
      }
    });
    onUpdateDataset(next);
  };

  const handleExportDataJs = () => {
    const out: TahfizDataset = {
      ...dataset,
      updated: `${new Date().toISOString().slice(0, 19)}Z`,
    };
    const txt = `// Data hantaran hafazan MTS Tumpat.\n// Fail ini diganti setiap kali ustaz mengemas kini data (lihat README.md).\nwindow.DATA=${JSON.stringify(
      out
    ).replace(/</g, '\\u003c')};\n`;
    const blob = new Blob([txt], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ustaz-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-[#101010] border border-[#DEDBC8]/15 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-[#DEDBC8]/10 shrink-0">
              <div>
                <p className="text-primary text-xs mb-1">
                  Mod Ustaz · Draf disimpan dalam pelayar
                </p>
                <h3
                  id="ustaz-modal-title"
                  className="text-xl sm:text-2xl font-normal"
                  style={{ color: '#E1E0CC' }}
                >
                  Isi Hantaran Harian
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Mod Ustaz"
                className="w-9 h-9 rounded-full bg-[#212121] flex items-center justify-center text-primary hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
              {/* Date Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditDate(addDays(editDate, -1))}
                    aria-label="Hari sebelum"
                    className="w-9 h-9 rounded-lg bg-[#212121] text-[#E1E0CC] flex items-center justify-center hover:bg-[#2a2a2a] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => e.target.value && setEditDate(e.target.value)}
                    className="rounded-lg bg-[#212121] border border-[#DEDBC8]/15 px-3 py-1.5 text-xs sm:text-sm text-[#E1E0CC] focus:outline-none focus:border-[#DEDBC8]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setEditDate(addDays(editDate, 1))}
                    aria-label="Hari berikut"
                    className="w-9 h-9 rounded-lg bg-[#212121] text-[#E1E0CC] flex items-center justify-center hover:bg-[#2a2a2a] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDate(getTodayKey())}
                    className="rounded-lg bg-[#212121] px-3 py-2 text-xs text-primary hover:bg-[#2a2a2a] cursor-pointer whitespace-nowrap"
                  >
                    Hari ini
                  </button>
                </div>

                <p className="text-xs text-gray-400 tabular-nums">
                  {formatLongDate(editDate)} · diisi {filledCount}/{dataset.santri.length}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllH}
                  className="rounded-lg bg-[#212121] border border-[#74A88E]/40 px-3 py-2 text-xs text-[#E1E0CC] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  Semua kosong → Telah Menghantar
                </button>
                {prevDate && (
                  <button
                    type="button"
                    onClick={handleCopyPrev}
                    className="rounded-lg bg-[#212121] border border-[#DEDBC8]/15 px-3 py-2 text-xs text-gray-300 hover:text-[#E1E0CC] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    Salin yang kosong daripada {formatShortDate(prevDate)}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFixedPages((v) => !v)}
                  className="rounded-lg bg-[#212121] border border-[#DEDBC8]/15 px-3 py-2 text-xs text-primary hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  {showFixedPages ? 'Tutup jadual m/s tetap' : 'Jadual m/s tetap'}
                </button>
              </div>

              {/* Fixed Pages Config */}
              {showFixedPages && (
                <div className="rounded-xl bg-[#181818] border border-[#DEDBC8]/10 p-4 space-y-2.5">
                  <p className="text-xs text-gray-400">
                    Nilai m/s lama (1–20) dan baru (1–5) dipakai automatik apabila status Telah Menghantar dipilih.
                  </p>
                  {dataset.santri.map((s, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 py-1.5 border-b border-[#DEDBC8]/5 last:border-0"
                    >
                      <span className="sm:col-span-6 text-xs text-[#E1E0CC] truncate">
                        {s.n}
                      </span>
                      <div className="sm:col-span-3 flex items-center gap-2">
                        <span className="text-[11px] text-gray-500">Lama:</span>
                        <select
                          value={s.ml ?? ''}
                          onChange={(e) => handleFixedPageChange(idx, 'ml', e.target.value)}
                          className="w-full rounded bg-[#212121] px-2 py-1 text-xs text-[#E1E0CC]"
                        >
                          <option value="">–</option>
                          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex items-center gap-2">
                        <span className="text-[11px] text-gray-500">Baru:</span>
                        {s.hafiz ? (
                          <span className="text-[11px] text-gray-500">tiada (Hafiz)</span>
                        ) : (
                          <select
                            value={s.mb ?? ''}
                            onChange={(e) => handleFixedPageChange(idx, 'mb', e.target.value)}
                            className="w-full rounded bg-[#212121] px-2 py-1 text-xs text-[#E1E0CC]"
                          >
                            <option value="">–</option>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Student Rows */}
              <div className="space-y-3">
                {dataset.santri.map((s, idx) => {
                  const st = s.l[editDate];
                  const d = s.d?.[editDate] || {};
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#212121] p-4 space-y-3 border border-[#DEDBC8]/5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <input
                          type="text"
                          value={s.n}
                          onChange={(e) => handleNameChange(idx, e.target.value)}
                          aria-label="Nama pelajar"
                          className="flex-1 min-w-[200px] bg-transparent text-sm text-[#E1E0CC] border-b border-transparent focus:border-[#DEDBC8]/30 focus:outline-none py-0.5"
                        />
                        <button
                          type="button"
                          onClick={() => handleToggleHafiz(idx)}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                            s.hafiz
                              ? 'bg-primary text-black font-medium'
                              : 'bg-[#151515] text-gray-400 hover:text-[#E1E0CC]'
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          <span>Hafiz</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {(['H', 'T', 'S', 'I'] as StatusCode[]).map((code) => {
                          const active = st === code;
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() => handleToggleStatus(idx, code)}
                              className={`rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
                                active
                                  ? 'bg-primary text-black'
                                  : 'bg-[#151515] text-gray-400 hover:text-[#E1E0CC]'
                              }`}
                            >
                              {STATUS_SHORT[code]}
                            </button>
                          );
                        })}
                      </div>

                      {st === 'H' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <label className="block text-xs text-gray-400">
                            Juzuk (mula)
                            <select
                              value={d.j ?? ''}
                              onChange={(e) => handleDetailChange(idx, 'j', e.target.value)}
                              className="mt-1 w-full rounded-lg bg-[#151515] border border-[#DEDBC8]/10 px-3 py-1.5 text-xs text-[#E1E0CC]"
                            >
                              <option value="">–</option>
                              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                  Juzuk {n}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-xs text-gray-400">
                            Bil. juzuk dihantar
                            <select
                              value={d.n ?? 1}
                              onChange={(e) => handleDetailChange(idx, 'n', e.target.value)}
                              className="mt-1 w-full rounded-lg bg-[#151515] border border-[#DEDBC8]/10 px-3 py-1.5 text-xs text-[#E1E0CC]"
                            >
                              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                  {n === 1 ? '1 (biasa)' : n}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-t border-[#DEDBC8]/10 bg-[#0d0d0d] shrink-0">
              <button
                type="button"
                onClick={onResetDraft}
                className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#E1E0CC] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Padam draf &amp; kembali ke data asal</span>
              </button>

              <button
                type="button"
                onClick={handleExportDataJs}
                className="inline-flex items-center gap-2 bg-primary text-black font-medium text-xs sm:text-sm rounded-full px-5 py-2.5 hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Muat turun data.js</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
