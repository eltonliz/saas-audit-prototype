/** V2·0901 商城签到（每日幂等）——课堂红包领取前置 */
const KEY = 'saas-signin-days';

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isSignedToday(): boolean {
  try {
    const days: string[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    return days.includes(todayKey());
  } catch { return false; }
}

/** 签到（当日幂等）。返回是否本次新签 */
export function signInToday(): boolean {
  if (isSignedToday()) return false;
  const days: string[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  days.push(todayKey());
  localStorage.setItem(KEY, JSON.stringify(days));
  return true;
}
