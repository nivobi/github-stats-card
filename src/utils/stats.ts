import type { ContributionCalendar, Streak } from "../types.js";

export function calculateStreak(calendar: ContributionCalendar): Streak {
  const days = calendar.weeks.flatMap((w) => w.contributionDays).reverse();
  let streak = 0;
  let endDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let startDate = endDate;

  if (days.length === 0) {
    return { days: 0, start: endDate, end: endDate };
  }

  let i = 0;
  if (days[0]?.contributionCount === 0) i = 1;

  for (; i < days.length; i++) {
    const day = days[i];
    if (day && day.contributionCount > 0) {
      streak++;
      startDate = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      break;
    }
  }
  return { days: streak, start: startDate, end: endDate };
}

export function calculateMonthCommits(calendar: ContributionCalendar): number {
  const allDays = calendar.weeks.flatMap((w) => w.contributionDays);
  const last30 = allDays.slice(-30);
  return last30.reduce((total, day) => total + day.contributionCount, 0);
}
