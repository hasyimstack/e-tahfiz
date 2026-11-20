export type StatusCode = 'H' | 'T' | 'S' | 'I';

export interface DailyDetail {
  j?: number | string; // Juzuk mula
  l?: number | string; // M/s lama
  b?: number | string; // M/s baru
  n?: number | string; // Bilangan juzuk dihantar
}

export interface Santri {
  n: string; // Nama pelajar
  l: Record<string, StatusCode>; // Log status harian
  d: Record<string, DailyDetail>; // Butiran hafazan harian
  hafiz?: boolean;
  ml?: number; // Muka surat lama tetap
  mb?: number; // Muka surat baru tetap
}

export interface TahfizDataset {
  santri: Santri[];
  updated: string;
}

export const STATUS_LABELS: Record<StatusCode, string> = {
  H: 'Telah Menghantar',
  T: 'Tidak Menghantar',
  S: 'Sakit',
  I: 'Izin',
};

export const STATUS_SHORT: Record<StatusCode, string> = {
  H: 'Hantar',
  T: 'Tidak',
  S: 'Sakit',
  I: 'Izin',
};

export const STATUS_COLORS: Record<StatusCode, string> = {
  H: '#74A88E',
  T: '#C4736D',
  S: '#C8A96E',
  I: '#7B98B8',
};

export const PERIOD_LABELS: Record<number, string> = {
  1: '1 hari',
  7: '1 minggu',
  30: '1 bulan',
  90: '3 bulan',
  180: '6 bulan',
  365: '1 tahun',
};

// Exact dataset from https://hasyimstack.github.io/website-e-tahfiz/data.js
export const INITIAL_TAHFIZ_DATA: TahfizDataset = {
  santri: [
    {
      n: 'Muhammad Fawwaz Saufi Bin Noor Hisham',
      l: {
        '2026-11-18': 'T',
        '2026-11-17': 'T',
        '2026-11-16': 'H',
        '2026-11-02': 'H',
        '2026-11-03': 'T',
        '2026-11-04': 'H',
        '2026-11-05': 'T',
        '2026-11-06': 'H',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'H',
        '2026-11-12': 'T',
        '2026-11-13': 'H',
        '2026-11-14': 'T',
        '2026-11-19': 'H',
      },
      d: {
        '2026-11-16': { j: 26, l: 17, b: 3 },
        '2026-11-02': { j: 18, l: 17, b: 3 },
        '2026-11-04': { j: 19, l: 17, b: 3 },
        '2026-11-06': { j: 20, l: 17, b: 3 },
        '2026-11-07': { j: 23, l: 17, b: 3 },
        '2026-11-09': { j: 21, l: 17, b: 3 },
        '2026-11-10': { j: 22, l: 17, b: 3 },
        '2026-11-13': { j: 25, l: 17, b: 3 },
        '2026-11-19': { j: 27, l: 17, b: 3 },
      },
    },
    {
      n: 'Ahmad Syahid Iqbal Bin Ahmad Syaiful',
      l: {
        '2026-11-18': 'I',
        '2026-11-17': 'I',
        '2026-11-16': 'I',
        '2026-11-02': 'H',
        '2026-11-03': 'H',
        '2026-11-04': 'H',
        '2026-11-05': 'H',
        '2026-11-06': 'H',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'H',
        '2026-11-11': 'H',
        '2026-11-12': 'H',
        '2026-11-13': 'H',
        '2026-11-14': 'H',
        '2026-11-19': 'T',
      },
      d: {
        '2026-11-02': { j: 23, l: 20, b: 0 },
        '2026-11-03': { j: 24, l: 20, b: 0 },
        '2026-11-04': { j: 25, l: 20, b: 10 },
        '2026-11-05': { j: 26, l: 20, b: 0 },
        '2026-11-06': { j: 26, l: 20, b: 0 },
        '2026-11-07': { j: 28, l: 20, b: 0 },
        '2026-11-09': { j: 29, l: 20, b: 0 },
        '2026-11-10': { j: 1, l: 20, b: 0 },
        '2026-11-11': { j: 2, l: 20, b: 0 },
        '2026-11-12': { j: 3, l: 20, b: 0 },
        '2026-11-13': { j: 4, l: 20, b: 0 },
        '2026-11-14': { j: 5, l: 20, b: 0 },
      },
    },
    {
      n: 'Ahmad Dawood Bin Ahmad Fahmi Reza',
      l: {
        '2026-11-18': 'H',
        '2026-11-17': 'H',
        '2026-11-16': 'H',
        '2026-11-02': 'T',
        '2026-11-03': 'H',
        '2026-11-04': 'H',
        '2026-11-05': 'H',
        '2026-11-06': 'H',
        '2026-11-07': 'H',
        '2026-11-09': 'S',
        '2026-11-10': 'S',
        '2026-11-11': 'S',
        '2026-11-12': 'S',
        '2026-11-13': 'T',
        '2026-11-14': 'T',
        '2026-11-19': 'H',
      },
      d: {
        '2026-11-03': { j: 1, l: 10, b: 0 },
        '2026-11-04': { j: 2, l: 10, b: 0 },
        '2026-11-05': { j: 3, l: 10, b: 0 },
        '2026-11-06': { j: 4, l: 10, b: 0 },
        '2026-11-07': { j: 5, l: 10, b: 0 },
        '2026-11-16': { j: 6, l: 10, b: 0 },
        '2026-11-17': { j: 7, l: 10, b: 0 },
        '2026-11-18': { j: 8, l: 10, b: 0 },
        '2026-11-19': { j: 9, l: 10, b: 0 },
      },
    },
    {
      n: 'Wan Muhammad Syafiq Adli Bin Wan Ahmad Shawqi',
      l: {
        '2026-11-18': 'S',
        '2026-11-17': 'S',
        '2026-11-16': 'S',
        '2026-11-02': 'H',
        '2026-11-03': 'H',
        '2026-11-04': 'H',
        '2026-11-05': 'H',
        '2026-11-06': 'H',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'S',
        '2026-11-11': 'S',
        '2026-11-12': 'S',
        '2026-11-13': 'S',
        '2026-11-14': 'S',
        '2026-11-19': 'S',
      },
      d: {
        '2026-11-02': { j: 2, l: 10, b: 0 },
        '2026-11-03': { j: 3, l: 10, b: 0 },
        '2026-11-04': { j: 4, l: 10, b: 0 },
        '2026-11-05': { j: 5, l: 10, b: 0 },
        '2026-11-06': { j: 6, l: 10, b: 0 },
        '2026-11-07': { j: 7, l: 10, b: 0 },
        '2026-11-09': { j: 8, l: 10, b: 0 },
      },
    },
    {
      n: 'Ahmad Amirul Asyraf Bin Ahmad Waridi',
      l: {
        '2026-11-18': 'T',
        '2026-11-17': 'T',
        '2026-11-16': 'T',
        '2026-11-02': 'T',
        '2026-11-03': 'H',
        '2026-11-04': 'H',
        '2026-11-05': 'T',
        '2026-11-06': 'H',
        '2026-11-07': 'T',
        '2026-11-09': 'T',
        '2026-11-10': 'T',
        '2026-11-11': 'S',
        '2026-11-12': 'H',
        '2026-11-13': 'T',
        '2026-11-14': 'T',
        '2026-11-19': 'H',
      },
      d: {
        '2026-11-03': { j: 22, l: 10, b: 2 },
        '2026-11-04': { j: 23, l: 10, b: 2 },
        '2026-11-06': { j: 24, l: 10, b: 2 },
        '2026-11-12': { j: 25, l: 10, b: 2 },
        '2026-11-19': { j: 26, l: 10, b: 2 },
      },
    },
    {
      n: 'Muhammad Munir Bin Muhd Shahriyal',
      l: {
        '2026-11-18': 'I',
        '2026-11-17': 'I',
        '2026-11-16': 'I',
        '2026-11-02': 'H',
        '2026-11-03': 'H',
        '2026-11-04': 'H',
        '2026-11-05': 'H',
        '2026-11-06': 'T',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'H',
        '2026-11-11': 'S',
        '2026-11-12': 'H',
        '2026-11-13': 'I',
        '2026-11-14': 'I',
        '2026-11-19': 'I',
      },
      d: {
        '2026-11-02': { j: 24, l: 16, b: 4 },
        '2026-11-03': { j: 25, l: 16, b: 4 },
        '2026-11-04': { j: 26, l: 16, b: 4 },
        '2026-11-05': { j: 27, l: 16, b: 4 },
        '2026-11-07': { j: 29, l: 16, b: 4 },
        '2026-11-09': { j: 28, l: 16, b: 4 },
        '2026-11-10': { j: 30, l: 164, b: 4 },
        '2026-11-12': { j: 1, l: 20, b: 0 },
      },
    },
    {
      n: 'Mikram Zuhayr Bin Muhammad Zuhri',
      l: {
        '2026-11-18': 'H',
        '2026-11-17': 'T',
        '2026-11-16': 'H',
        '2026-11-02': 'I',
        '2026-11-03': 'T',
        '2026-11-04': 'H',
        '2026-11-05': 'H',
        '2026-11-06': 'T',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'S',
        '2026-11-11': 'S',
        '2026-11-12': 'S',
        '2026-11-13': 'S',
        '2026-11-14': 'S',
        '2026-11-19': 'T',
      },
      d: {
        '2026-11-04': { j: 28, l: 20, b: 0 },
        '2026-11-05': { j: 1, l: 20, b: 0 },
        '2026-11-07': { j: 2, l: 20, b: 0 },
        '2026-11-09': { j: 3, l: 20, b: 0 },
        '2026-11-16': { j: 4, l: 20, b: 0 },
        '2026-11-18': { j: 5, l: 20, b: 0 },
      },
    },
    {
      n: 'Ahmad Mubasyir Bin Akila',
      l: {
        '2026-11-18': 'H',
        '2026-11-17': 'T',
        '2026-11-16': 'S',
        '2026-11-02': 'H',
        '2026-11-03': 'H',
        '2026-11-04': 'H',
        '2026-11-05': 'H',
        '2026-11-06': 'H',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'S',
        '2026-11-11': 'S',
        '2026-11-12': 'S',
        '2026-11-13': 'S',
        '2026-11-14': 'S',
        '2026-11-19': 'T',
      },
      d: {
        '2026-11-02': { j: 2, l: 20, b: 0 },
        '2026-11-03': { j: 3, l: 20, b: 0 },
        '2026-11-04': { j: 4, l: 20, b: 0 },
        '2026-11-05': { j: 5, l: 20, b: 0 },
        '2026-11-06': { j: '', l: 20, b: 0 },
        '2026-11-07': { l: 20, b: 0 },
        '2026-11-09': { j: 6, l: 20, b: 0 },
        '2026-11-18': { j: 7, l: 20, b: 0 },
      },
    },
    {
      n: 'Muhammad Raqin Asyraaf bin Mohamad Firdaus',
      l: {
        '2026-11-18': 'I',
        '2026-11-17': 'I',
        '2026-11-16': 'I',
        '2026-11-02': 'T',
        '2026-11-03': 'H',
        '2026-11-04': 'T',
        '2026-11-05': 'H',
        '2026-11-06': 'T',
        '2026-11-07': 'H',
        '2026-11-09': 'H',
        '2026-11-10': 'H',
        '2026-11-11': 'H',
        '2026-11-12': 'H',
        '2026-11-13': 'H',
        '2026-11-14': 'H',
        '2026-11-19': 'I',
      },
      d: {
        '2026-11-03': { j: 22, l: 10, b: 0 },
        '2026-11-05': { j: 23, l: 10, b: 0 },
        '2026-11-07': { j: 24, l: 10, b: 0 },
        '2026-11-09': { j: 25, l: 10, b: 0 },
        '2026-11-10': { j: 27, l: 10, b: 0 },
        '2026-11-11': { j: 26, l: 10, b: 0 },
        '2026-11-12': { j: 30, l: 10, b: 0 },
        '2026-11-13': { j: 27, l: 10, b: 0 },
        '2026-11-14': { j: 29, l: 10, b: 0 },
      },
    },
    { n: 'Santri 10', l: {}, d: {} },
    { n: 'Santri 11', l: {}, d: {} },
  ],
  updated: '2026-11-19T03:51:25Z',
};

export function formatKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function getTodayKey(): string {
  return formatKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + n);
  return formatKey(d);
}

export function formatLongDate(key: string): string {
  try {
    return new Date(`${key}T00:00:00`).toLocaleDateString('ms-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return key;
  }
}

export function formatShortDate(key: string): string {
  try {
    return new Date(`${key}T00:00:00`).toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return key;
  }
}

export function getWindowKeys(per: number, anchorDate?: string): string[] {
  const base = anchorDate || getTodayKey();
  const arr: string[] = [];
  for (let i = per - 1; i >= 0; i--) {
    arr.push(addDays(base, -i));
  }
  return arr;
}

export function countStatuses(
  santri: Santri,
  keys: string[]
): Record<StatusCode, number> {
  const counts: Record<StatusCode, number> = { H: 0, T: 0, S: 0, I: 0 };
  keys.forEach((k) => {
    const status = santri.l[k];
    if (status) counts[status]++;
  });
  return counts;
}

export function jEnd(detail: DailyDetail): number {
  const start = Number(detail.j) || 0;
  const count = Math.max(0, (Number(detail.n) || 1) - 1);
  return Math.min(30, start + count);
}

export function getCurrentJuzuk(santri: Santri): string {
  const keys = Object.keys(santri.d || {})
    .filter((k) => santri.d[k]?.j !== undefined && santri.d[k]?.j !== '')
    .sort();
  if (!keys.length) return '–';
  return String(jEnd(santri.d[keys[keys.length - 1]]));
}

export function getLatestRecordKey(santri: Santri, maxDate?: string): string | null {
  const cap = maxDate || getTodayKey();
  const keys = Object.keys(santri.l || {})
    .filter((k) => k <= cap)
    .sort();
  return keys.length ? keys[keys.length - 1] : null;
}

export function getDetailText(santri: Santri, key: string): string {
  const d = santri.d?.[key];
  if (!d) return '';
  const parts: string[] = [];
  if (d.j !== undefined && d.j !== '') {
    const n = Number(d.n) || 1;
    parts.push(
      n > 1 ? `Juzuk ${d.j}–${jEnd(d)} (${n} juzuk)` : `Juzuk ${d.j}`
    );
  }
  if (d.l !== undefined && d.l !== '') {
    parts.push(`Lama ${d.l} m/s`);
  }
  if (d.b !== undefined && d.b !== '') {
    parts.push(`Baru ${d.b} m/s`);
  }
  return parts.join(' · ');
}
