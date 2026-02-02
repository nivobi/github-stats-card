import type { ContributionCalendar, Streak } from "../types";

export function calculateStreak(calendar: ContributionCalendar): Streak {
  const days = calendar.weeks.flatMap((w) => w.contributionDays).reverse();
  let streak = 0;
  let endDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let startDate = endDate;

  let i = 0;
  if (days[0].contributionCount === 0) i = 1;

  for (; i < days.length; i++) {
    if (days[i].contributionCount > 0) {
      streak++;
      startDate = new Date(days[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
