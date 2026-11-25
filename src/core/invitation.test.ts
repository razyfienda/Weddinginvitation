import test from 'node:test';
import assert from 'node:assert/strict';
import { safeText, escapeHtml, safeUrl, safeHexColor } from './sanitize';
import { parseEventTimestamp, computeCountdownParts, formatIndonesianDate } from './utils';
import { createStore } from './store';
import { mergeWithDefaults } from '../services/repository';

test('safeText strips angle brackets, control chars, and enforces max length', () => {
  assert.equal(safeText('  <script>alert(1)</script> Halo  ', 50), 'scriptalert(1)/script Halo');
  assert.equal(safeText('abcdef', 3), 'abc');
  assert.equal(safeText('hello\u0000world'), 'helloworld');
});

test('escapeHtml escapes HTML special characters', () => {
  assert.equal(
    escapeHtml(`<a href="x" data-x='y'>A & B</a>`),
    '&lt;a href=&quot;x&quot; data-x=&#39;y&#39;&gt;A &amp; B&lt;/a&gt;'
  );
});

test('safeUrl allows safe image data URIs, http(s), and relative asset paths while blocking javascript:', () => {
  assert.equal(safeUrl('https://example.com/photo.jpg'), 'https://example.com/photo.jpg');
  assert.equal(safeUrl('/src/assets/images/hero.jpg'), '/src/assets/images/hero.jpg');
  assert.equal(
    safeUrl('data:image/svg+xml;charset=UTF-8,%3Csvg%3E%3C/svg%3E'),
    'data:image/svg+xml;charset=UTF-8,%3Csvg%3E%3C/svg%3E'
  );
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,<script>alert(1)</script>'), '');
});

test('safeHexColor validates 6-digit hex codes and falls back safely', () => {
  assert.equal(safeHexColor('#b5965a'), '#b5965a');
  assert.equal(safeHexColor('red', '#88682e'), '#88682e');
});

test('parseEventTimestamp handles WIB, WITA, and WIT offsets accurately', () => {
  const wib = parseEventTimestamp('2027-06-20T08:00', 'WIB');
  const wita = parseEventTimestamp('2027-06-20T08:00', 'WITA');
  const wit = parseEventTimestamp('2027-06-20T08:00', 'WIT');
  assert.equal(wib - wita, 3600 * 1000);
  assert.equal(wita - wit, 3600 * 1000);
  assert.equal(new Date(wib).toISOString(), '2027-06-20T01:00:00.000Z');
});

test('computeCountdownParts returns counting, reached, and invalid states', () => {
  const target = Date.UTC(2027, 5, 20, 1, 0, 0);
  const now = target - (2 * 86400000 + 3 * 3600000 + 4 * 60000 + 5 * 1000);
  const counting = computeCountdownParts(target, now);
  assert.deepEqual(counting, { status: 'counting', days: 2, hours: 3, minutes: 4, seconds: 5 });

  assert.equal(computeCountdownParts(target, target + 1000).status, 'reached');
  assert.equal(computeCountdownParts(NaN, now).status, 'invalid');
});

test('formatIndonesianDate formats valid dates and handles invalid input', () => {
  const formatted = formatIndonesianDate('2027-06-20T08:00');
  assert.ok(formatted.includes('2027'));
  assert.equal(formatIndonesianDate('invalid-date'), 'Tanggal segera diumumkan');
});

test('createStore notifies subscribers and updates state', () => {
  const store = createStore({ count: 1 });
  let observed = 0;
  const unsub = store.subscribe((s: { count: number }) => {
    observed = s.count;
  });
  store.setState((prev: { count: number }) => ({ count: prev.count + 1 }));
  assert.equal(observed, 2);
  unsub();
  store.setState({ count: 5 });
  assert.equal(observed, 2);
});

import { isStandaloneMode, isIOSDevice, getInstallActionMode } from '../pwa/install-state';

test('mergeWithDefaults preserves defaults for missing fields', () => {
  const merged = mergeWithDefaults({ wedding: { namaPria: 'Raka' } });
  assert.equal(merged.wedding.namaPria, 'Raka');
  assert.equal(merged.wedding.namaWanita, 'Naira');
  assert.ok(merged.events.length >= 2);
  assert.ok(merged.gifts.length >= 2);
});

test('PWA install-state helpers detect standalone, iOS, and install action mode', () => {
  assert.equal(isStandaloneMode({ matchMediaStandalone: true }), true);
  assert.equal(isStandaloneMode({ navigatorStandalone: true }), true);
  assert.equal(isStandaloneMode({}), false);

  assert.equal(isIOSDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'), true);
  assert.equal(isIOSDevice('Mozilla/5.0 (Linux; Android 14; Pixel 8)'), false);

  assert.equal(getInstallActionMode({ isInstalled: true, hasDeferredPrompt: true }), 'hidden');
  assert.equal(getInstallActionMode({ isInstalled: false, hasDeferredPrompt: true }), 'native-prompt');
  assert.equal(getInstallActionMode({ isInstalled: false, hasDeferredPrompt: false, isIOS: true }), 'ios-guide');
  assert.equal(getInstallActionMode({ isInstalled: false, hasDeferredPrompt: false, isIOS: false }), 'manual-guide');
});
