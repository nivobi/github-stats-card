import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

// ===== TYPES =====
interface GitHubStats {
  totalCommits: number;
  calendar: ContributionCalendar;
  lastPush: string;
  lastHash: string;
  recentLanguage: string;
  topLanguage: string;
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: Week[];
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface Role {
  key: string;
  name: string;
  desc: string;
}

interface Streak {
  days: number;
  start: string;
  end: string;
}

// ===== CONFIG =====
const ICONS: Record<string, string> = {
  goblin: "icon_goblin",
  human: "icon_human",
  caffeine: "icon_caffeine",
  grass: "icon_grass",
  hibernate: "icon_hibernate",
  ancient: "icon_ancient"
};

// ===== UTILS =====
function getRole(hours: number): Role {
  if (hours <= 2) return { key: "goblin", name: "Full-on Goblin Mode", desc: "Writing code faster than I can think." };
  if (hours <= 12) return { key: "human", name: "Productive Human", desc: "Caffeine levels stable. Systems operational." };
  if (hours <= 24) return { key: "grass", name: "Touching Grass", desc: "Outside... what is that bright light?" };
  if (hours <= 48) return { key: "caffeine", name: "Caffeine Critical", desc: "System shutting down. Send coffee." };
  if (hours <= 168) return { key: "hibernate", name: "Hibernating", desc: "Recharging neural networks." };
  return { key: "ancient", name: "Ancient One", desc: "Last seen eons ago..." };
}

function calculateStreak(calendar: ContributionCalendar): Streak {
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

function calculateMonthCommits(calendar: ContributionCalendar): number {
  const allDays = calendar.weeks.flatMap((w) => w.contributionDays);
  const last30 = allDays.slice(-30);
  return last30.reduce((total, day) => total + day.contributionCount, 0);
}

// ===== GITHUB API =====

// Fetch stats using REST API (for unauthenticated requests)
async function getGitHubStatsREST(user: string): Promise<GitHubStats> {
  // Fetch user's repositories
  const reposResponse = await fetch(
    `https://api.github.com/users/${user}/repos?sort=pushed&per_page=30&type=owner`,
    { headers: { "Accept": "application/vnd.github.v3+json" } }
  );

  if (!reposResponse.ok) {
    throw new Error(`User "${user}" not found or API error: ${reposResponse.statusText}`);
  }

  const repos = await reposResponse.json() as any[];

  // Filter out forks and get recent repos
  const nonForkRepos = repos.filter((repo: any) => !repo.fork);
  const recentRepo = nonForkRepos[0];

  // Calculate most used language from recent repos
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const languageCount: Record<string, number> = {};
  for (const repo of nonForkRepos) {
    if (!repo.pushed_at) continue;

    const pushedDate = new Date(repo.pushed_at);
    if (pushedDate >= thirtyDaysAgo && repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }
  }

  // Find most used language
  let mostUsedLanguage = "Code";
  let maxCount = 0;
  for (const [lang, count] of Object.entries(languageCount)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedLanguage = lang;
    }
  }

  const now = new Date().toISOString();
  const defaultHash = "0000000";

  // Create a mock calendar (we can't get real contribution data without GraphQL auth)
  const mockCalendar = {
    totalContributions: 0,
    weeks: []
  };

  return {
    totalCommits: 0, // Can't get real commit count without GraphQL
    calendar: mockCalendar,
    lastPush: recentRepo?.pushed_at || now,
    lastHash: defaultHash,
    recentLanguage: mostUsedLanguage,
    topLanguage: recentRepo?.language || mostUsedLanguage || "Code",
  };
}

// Fetch stats using GraphQL API (for authenticated requests)
async function getGitHubStatsGraphQL(user: string, token: string): Promise<GitHubStats> {
  const query = `
    query {
      user(login: "${user}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { contributionCount date } }
          }
        }
        repositories(first: 30, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            name
            pushedAt
            primaryLanguage { name }
            defaultBranchRef { target { ... on Commit { oid } } }
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
        topRepositories(first: 1, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes { primaryLanguage { name } }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query }),
  });

  const json: any = await response.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));

  const userData = json.data?.user;
  if (!userData) {
    throw new Error(`User "${user}" not found`);
  }

  const allRepos = userData.repositories.nodes;
  const recentRepo = allRepos[0];
  const topRepo = userData.topRepositories?.nodes?.[0];

  // Calculate most used language in past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const languageStats: Record<string, number> = {};

  for (const repo of allRepos) {
    if (!repo.pushedAt) continue;

    const pushedDate = new Date(repo.pushedAt);
    if (pushedDate >= thirtyDaysAgo) {
      // Aggregate language usage by bytes
      if (repo.languages?.edges) {
        for (const edge of repo.languages.edges) {
          const langName = edge.node.name;
          const size = edge.size || 0;
          languageStats[langName] = (languageStats[langName] || 0) + size;
        }
      }
    }
  }

  // Find most used language
  let mostUsedLanguage = "Code";
  let maxSize = 0;
  for (const [lang, size] of Object.entries(languageStats)) {
    if (size > maxSize) {
      maxSize = size;
      mostUsedLanguage = lang;
    }
  }

  const now = new Date().toISOString();
  const defaultHash = "0000000";

  return {
    totalCommits: userData.contributionsCollection.contributionCalendar.totalContributions,
    calendar: userData.contributionsCollection.contributionCalendar,
    lastPush: recentRepo?.pushedAt || now,
    lastHash: recentRepo?.defaultBranchRef?.target?.oid || defaultHash,
    recentLanguage: mostUsedLanguage,
    topLanguage: topRepo?.primaryLanguage?.name || recentRepo?.primaryLanguage?.name || "Code",
  };
}

async function getGitHubStats(user: string, token?: string): Promise<GitHubStats> {
  if (token) {
    return getGitHubStatsGraphQL(user, token);
  } else {
    return getGitHubStatsREST(user);
  }
}

// ===== SVG RENDERING =====
function renderSvg(
  template: string,
  data: GitHubStats,
  role: Role,
  streak: Streak,
  monthCommits: number
): string {
  let svg = template;

  const setText = (id: string, text: string | number) => {
    const regex = new RegExp(`(<text[^>]*id="${id}"[^>]*>)[\\s\\S]*?(<\\/text>)`, "g");
    svg = svg.replace(regex, `$1${text}$2`);
  };

  setText("role_name", role.name);
  setText("role_desc", `"${role.desc}"`);
  setText("streak_count", streak.days);
  setText("streak_range", `${streak.start} - ${streak.end}`);
  setText("total_commits", data.totalCommits);
  setText("month_commits", monthCommits);
  setText("lang_main", data.topLanguage);
  setText("lang_recent", data.recentLanguage);
  setText("commit_hash", `#${data.lastHash.substring(0, 7)}`);

  const activeIconId = ICONS[role.key];
  let css = "<style>";

  css += `#role_name, #role_desc { text-anchor: middle !important; } `;

  Object.values(ICONS).forEach(iconId => {
    if (iconId === activeIconId) {
      css += `#${iconId} { display: inline !important; visibility: visible !important; opacity: 1 !important; } `;
    } else {
      css += `#${iconId} { display: none !important; visibility: hidden !important; opacity: 0 !important; } `;
    }
  });
  css += "</style>";

  svg = svg.replace(/<\/svg>/, `${css}</svg>`);

  return svg;
}

// ===== TEMPLATE LOADER =====
function getSvgTemplate(): string {
  const templatePath = join(process.cwd(), 'src', 'template.svg');
  return readFileSync(templatePath, 'utf-8');
}

// ===== HANDLER =====
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get username from query parameter or fall back to environment variable
    const username = (req.query.username as string) || process.env.GITHUB_USERNAME || '';

    if (!username) {
      return res.status(400).send('Please provide a username via ?username=YOUR_USERNAME');
    }

    // Validate username format (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      return res.status(400).send('Invalid username format. Use only letters, numbers, and hyphens.');
    }

    // Determine which token to use
    const configuredUsername = process.env.GITHUB_USERNAME || '';
    const isOwner = username === configuredUsername;

    // Use owner's token if this is the owner, otherwise use fallback token if available
    const token = isOwner
      ? process.env.GITHUB_TOKEN
      : (process.env.GITHUB_FALLBACK_TOKEN || undefined);

    const data = await getGitHubStats(username, token);

    const now = new Date();
    const lastPush = new Date(data.lastPush);
    const hoursSincePush = (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60);

    const role = getRole(hoursSincePush);
    const streak = calculateStreak(data.calendar);
    const monthCommits = calculateMonthCommits(data.calendar);

    const svgTemplate = getSvgTemplate();
    const svg = renderSvg(svgTemplate, data, role, streak, monthCommits);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).send(`Error generating stats card: ${errorMessage}`);
  }
}
