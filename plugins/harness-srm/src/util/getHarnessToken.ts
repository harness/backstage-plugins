export function getSecureHarnessKey(key: string): string | undefined {
  try {
    const token = JSON.parse(decodeURI(atob(localStorage.getItem(key) || '')));
    return token ? `Bearer ${token}` : '';
  } catch (err) {
    // eslint-disable-next-line no-console
    return undefined;
  }
}
