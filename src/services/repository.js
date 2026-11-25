import { cloneDefaults } from '../core/defaults.js';

const STORAGE_KEY = 'weddingInvitationProd_v1';
const API_BASE = String(import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const isRemoteEnabled = Boolean(API_BASE);

export function mergeWithDefaults(raw) {
  const base = cloneDefaults();
  if (!raw || typeof raw !== 'object') return base;
  return {
    ...base,
    ...raw,
    wedding: { ...base.wedding, ...(raw.wedding || {}) },
    config: { ...base.config, ...(raw.config || {}) },
    events: Array.isArray(raw.events) && raw.events.length ? raw.events : base.events,
    gallery: Array.isArray(raw.gallery) ? raw.gallery : base.gallery,
    stories: Array.isArray(raw.stories) ? raw.stories : base.stories,
    gifts: Array.isArray(raw.gifts) ? raw.gifts : base.gifts,
    rsvps: Array.isArray(raw.rsvps) ? raw.rsvps : [],
    guestbook: Array.isArray(raw.guestbook) ? raw.guestbook : []
  };
}

export const repository = {
  async load() {
    let localData = cloneDefaults();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) localData = mergeWithDefaults(saved);
    } catch {
      // Ignore malformed storage
    }

    if (!isRemoteEnabled) return localData;

    try {
      const [rsvpRes, guestRes] = await Promise.all([
        fetch(`${API_BASE}/rsvps`),
        fetch(`${API_BASE}/guestbook`)
      ]);
      if (rsvpRes.ok) localData.rsvps = await rsvpRes.json();
      if (guestRes.ok) localData.guestbook = await guestRes.json();
    } catch {
      // Fallback to local data when remote API is unavailable
    }
    return localData;
  },

  saveLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },

  async addRsvp(entry, currentState) {
    if (isRemoteEnabled) {
      const res = await fetch(`${API_BASE}/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error('Gagal mengirim RSVP ke server.');
    }
    const next = { ...currentState, rsvps: [...currentState.rsvps, entry] };
    this.saveLocal(next);
    return next;
  },

  async addGuestbook(entry, currentState) {
    if (isRemoteEnabled) {
      const res = await fetch(`${API_BASE}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error('Gagal mengirim ucapan ke server.');
    }
    const next = { ...currentState, guestbook: [...currentState.guestbook, entry] };
    this.saveLocal(next);
    return next;
  },

  reset() {
    const fresh = cloneDefaults();
    this.saveLocal(fresh);
    return fresh;
  }
};
