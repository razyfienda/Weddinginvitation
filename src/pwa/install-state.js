export function isStandaloneMode({
  matchMediaStandalone = false,
  navigatorStandalone = false
} = {}) {
  return Boolean(matchMediaStandalone || navigatorStandalone);
}

export function isIOSDevice(userAgent = '') {
  return /iphone|ipad|ipod/i.test(String(userAgent));
}

export function getInstallActionMode({
  isInstalled = false,
  hasDeferredPrompt = false,
  isIOS = false
} = {}) {
  if (isInstalled) return 'hidden';
  if (hasDeferredPrompt) return 'native-prompt';
  if (isIOS) return 'ios-guide';
  return 'manual-guide';
}
