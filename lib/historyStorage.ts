import { HistoryItem, ReelBriefForm, ProductionKit } from '@/types/reelforge';

const HISTORY_STORAGE_KEY = 'reelforge_history_v1';
const MAX_HISTORY_ITEMS = 100;

export const loadHistoryFromStorage = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && item.id && item.result) as HistoryItem[];
  } catch (err) {
    console.error('Failed to load history from localStorage:', err);
    return [];
  }
};

export const saveHistoryToStorage = (items: HistoryItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
};

export const createHistoryItem = (formData: ReelBriefForm, resultData: ProductionKit): HistoryItem => {
  const itemId = resultData.id || ('rf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
  const now = new Date();
  return {
    id: itemId,
    createdAt: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    form: { ...formData },
    result: { ...resultData, id: itemId }
  };
};
