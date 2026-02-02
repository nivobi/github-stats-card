export interface GitHubStats {
  totalCommits: number;
  calendar: ContributionCalendar;
  lastPush: string;
  lastHash: string;
  recentLanguage: string;
  topLanguage: string;
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: Week[];
}

export interface Week {
  contributionDays: ContributionDay[];
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface Role {
  key: string;
  name: string;
  desc: string;
}

export interface Streak {
  days: number;
  start: string;
  end: string;
}
