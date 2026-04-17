import { CompletedWorkout } from '../types';

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateStreak(workouts: CompletedWorkout[]): number {
  if (workouts.length === 0) return 0;

  const sorted = [...workouts]
    .map((w) => w.date)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  const today = getTodayISO();
  let streak = 0;
  let checkDate = new Date(today + 'T12:00:00');

  if (sorted[0] !== today) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (sorted[0] !== checkDate.toISOString().split('T')[0]) {
      return 0;
    }
  }

  for (const dateStr of sorted) {
    const expected = checkDate.toISOString().split('T')[0];
    if (dateStr === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expected) {
      break;
    }
  }

  return streak;
}

export function getWeekNumber(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(Math.floor(diffDays / 7) + 1, 12);
}

export function getWorkoutsThisWeek(workouts: CompletedWorkout[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return workouts.filter((w) => new Date(w.date + 'T12:00:00') >= startOfWeek).length;
}

export function getTrainingDayOfWeek(): number {
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0;
  return dayOfWeek;
}

export function getHeatmapData(
  workouts: CompletedWorkout[],
  months: number = 6
): { date: string; count: number }[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const countMap: Record<string, number> = {};
  for (const w of workouts) {
    countMap[w.date] = (countMap[w.date] || 0) + 1;
  }

  const result: { date: string; count: number }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0];
    result.push({ date: key, count: countMap[key] || 0 });
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function getWorkoutsPerWeek(
  workouts: CompletedWorkout[],
  weeks: number = 8
): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    const dayOfWeek = now.getDay();
    const mondayDiff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(now.getDate() - mondayDiff - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = workouts.filter((w) => {
      const d = new Date(w.date + 'T12:00:00');
      return d >= weekStart && d <= weekEnd;
    }).length;

    const weekNum = Math.ceil(
      (weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    result.push({
      label: i === 0 ? 'HEUTE' : `W${weekNum}`,
      count,
    });
  }
  return result;
}
