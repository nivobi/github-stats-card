import type { GitHubStats } from "../types.js";

// Fetch stats using REST API (for unauthenticated requests)
async function getGitHubStatsREST(user: string): Promise<GitHubStats> {
  // Fetch user's repositories
  const reposResponse = await fetch(
    `https://api.github.com/users/${user}/repos?sort=pushed&per_page=5&type=owner`,
    { headers: { "Accept": "application/vnd.github.v3+json" } }
  );

  if (!reposResponse.ok) {
    throw new Error(`User "${user}" not found or API error: ${reposResponse.statusText}`);
  }

  const repos = await reposResponse.json() as any[];

  // Get recent repo data
  const recentRepo = repos[0];

  // Fetch user stats (we can't get contribution calendar without auth, so use approximation)
  const userResponse = await fetch(
    `https://api.github.com/users/${user}`,
    { headers: { "Accept": "application/vnd.github.v3+json" } }
  );

  const userData = await userResponse.json();

  const now = new Date().toISOString();
  const defaultHash = "0000000";

  // Create a mock calendar with zero contributions (since we can't get real data without auth)
  const mockCalendar = {
    totalContributions: 0,
    weeks: []
  };

  return {
    totalCommits: 0, // Can't get real commit count without GraphQL
    calendar: mockCalendar,
    lastPush: recentRepo?.pushed_at || now,
    lastHash: defaultHash, // Can't get commit hash from REST API easily
    recentLanguage: recentRepo?.language || "Code",
    topLanguage: recentRepo?.language || "Code",
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
        repositories(first: 5, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            name
            pushedAt
            primaryLanguage { name }
            defaultBranchRef { target { ... on Commit { oid } } }
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

  const recentRepo = userData.repositories.nodes[0];
  const topRepo = userData.topRepositories?.nodes?.[0];

  const now = new Date().toISOString();
  const defaultHash = "0000000";

  return {
    totalCommits: userData.contributionsCollection.contributionCalendar.totalContributions,
    calendar: userData.contributionsCollection.contributionCalendar,
    lastPush: recentRepo?.pushedAt || now,
    lastHash: recentRepo?.defaultBranchRef?.target?.oid || defaultHash,
    recentLanguage: recentRepo?.primaryLanguage?.name || "Code",
    topLanguage: topRepo?.primaryLanguage?.name || recentRepo?.primaryLanguage?.name || "Code",
  };
}

export async function getGitHubStats(user: string, token?: string): Promise<GitHubStats> {
  if (token) {
    console.log(`   → Using GraphQL API (authenticated) for ${user}`);
    return getGitHubStatsGraphQL(user, token);
  } else {
    console.log(`   → Using REST API (limited data) for ${user}`);
    return getGitHubStatsREST(user);
  }
}
