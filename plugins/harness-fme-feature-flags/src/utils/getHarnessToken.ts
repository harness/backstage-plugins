export function getSecureHarnessKey(key: string): string | undefined {
  try {
    const token = JSON.parse(decodeURI(atob(localStorage.getItem(key) || '')));
    return token ? `Bearer ${token}` : '';
  } catch (_) {
    // eslint-disable-next-line no-console
    console.log('Failed to read Harness tokens');
    return undefined;
  }
}
