import type { GitHubStats } from "../types";

export async function getGitHubStats(user: string, token: string): Promise<GitHubStats> {
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
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const json: any = await response.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));

  const userData = json.data.user;
  const recentRepo = userData.repositories.nodes[0];
  const topRepo = userData.topRepositories.nodes[0];

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
