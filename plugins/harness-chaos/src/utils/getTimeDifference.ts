export function timeDifference(current: number, previous: number): string {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  if (!current || !previous) {
    return '-';
  }

  const elapsed = current - previous;
  if (elapsed < milliSecondsPerMinute / 3) {
    return 'Just now';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago';
  }
  if (elapsed < milliSecondsPerHour) {
    return `${Math.round(elapsed / milliSecondsPerMinute)} mins ago`;
  }
  if (elapsed < milliSecondsPerDay) {
    return `${Math.round(elapsed / milliSecondsPerHour)} hours ago`;
  }
  if (elapsed < milliSecondsPerMonth) {
    return `${Math.round(elapsed / milliSecondsPerDay)} days ago`;
  }
  if (elapsed < milliSecondsPerYear) {
    return `${Math.round(elapsed / milliSecondsPerMonth)} months ago`;
  }
  return `${Math.round(elapsed / milliSecondsPerYear)} years ago`;
}
