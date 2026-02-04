# GitHub Stats Card

A dynamic SVG card that displays GitHub statistics with different status modes based on activity. Now supports **multi-user mode** - generate cards for any GitHub user!

![GitHub Stats](https://github-stats-card-chi.vercel.app/api/card)

## Features

- **Multi-User Support**: Generate cards for any GitHub username
- **Interactive Web Interface**: Easy-to-use form for creating cards
- **Dynamic Status Modes**: Changes based on last push activity
  - 🧌 Goblin Mode (< 2 hours)
  - 👤 Productive Human (< 12 hours)
  - 🌱 Touching Grass (< 24 hours)
  - ☕ Caffeine Critical (< 48 hours)
  - 😴 Hibernating (< 1 week)
  - ⏳ Ancient One (> 1 week)
- **GitHub Stats**: Total commits, monthly commits, current streak
- **Languages**: Displays most used and recently used languages
- **Live Updates**: Updates every 5 minutes with fresh data from GitHub
- **Smart Rate Limiting**: Uses authenticated API for configured user, public API for others

## Usage

### Web Interface

Visit the deployed app and use the interactive form to generate cards for any GitHub user:

1. Enter a GitHub username
2. Click "Generate Card"
3. Copy the shareable link or markdown code
4. Add to your GitHub profile or share anywhere!

### Direct API Usage

Generate a card for any user by adding the `username` query parameter:

```
https://your-app.vercel.app/api/card?username=GITHUB_USERNAME
```

**Examples:**
- `https://your-app.vercel.app/api/card?username=torvalds`
- `https://your-app.vercel.app/api/card?username=gaearon`
- `https://your-app.vercel.app/api/card?username=octocat`

### Add to Your GitHub Profile

Add this markdown to your profile README:

```markdown
![GitHub Stats](https://your-app.vercel.app/api/card?username=YOUR_USERNAME)
```

### Rate Limits & Data Availability

**Owner Mode** (with `GITHUB_TOKEN` for your username):
- Rate limit: 5,000 requests/hour
- Full data: Total commits, contribution streaks, commit history, languages

**Fallback Token Mode** (with `GITHUB_FALLBACK_TOKEN` for other users):
- Rate limit: 5,000 requests/hour (shared across all non-owner users)
- Full data for everyone until rate limit is reached
- Recommended for public deployments

**Unauthenticated Mode** (no fallback token):
- Rate limit: 60 requests/hour per IP
- Limited data: Recent language, activity status (commit count and streaks show as 0)
- Uses GitHub REST API instead of GraphQL

All cards are cached for 5 minutes to optimize rate limit usage.

## Local Development

### Prerequisites
- [Bun](https://bun.sh) installed

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/github-stats-card.git
cd github-stats-card
```

2. Install dependencies
```bash
bun install
```

3. Create `.env` file (use `.env.example` as template)
```bash
GITHUB_TOKEN=your_github_token_here
GITHUB_USERNAME=your_github_username
GITHUB_FALLBACK_TOKEN=optional_token_for_other_users
PORT=3000
```

**Token Configuration:**
- `GITHUB_TOKEN` - Your personal token (used for your own card)
- `GITHUB_USERNAME` - Your GitHub username
- `GITHUB_FALLBACK_TOKEN` - (Optional) A token used for all other users' cards. Without this, other users will only see limited stats.
- To create tokens: GitHub Settings → Developer settings → Personal access tokens → Generate new token (classic)
- Required scopes: `read:user`, `repo` (for private repo stats)

**Recommendation:** Use the same token for both `GITHUB_TOKEN` and `GITHUB_FALLBACK_TOKEN` if you're the only one using the app. For public deployments, consider creating a separate fallback token.

4. Run locally
```bash
bun run dev
```

5. Visit `http://localhost:3000` to see the web interface

### Testing Multi-User Mode Locally

Test different users by adding the username parameter:
- Default (your configured user): `http://localhost:3000`
- Other users: `http://localhost:3000?username=torvalds`
- API endpoint: `http://localhost:3000/api/card?username=octocat`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Deploying to Vercel
- Adding the card to your GitHub profile
- Troubleshooting

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/github-stats-card)

**Environment Variables:**
- `GITHUB_TOKEN` - (Optional) Your personal GitHub token for your own card
- `GITHUB_USERNAME` - (Optional) Your GitHub username
- `GITHUB_FALLBACK_TOKEN` - (Optional) Token for all other users (recommended for full stats)

**Without tokens:** App works but shows limited data (no commits/streaks).
**With fallback token:** Everyone gets full stats with 5,000 requests/hour shared limit.

## Project Structure

```
github-stats-card/
├── api/
│   └── card.ts              # Vercel serverless function
├── src/
│   ├── config.ts            # Configuration & constants
│   ├── types.ts             # TypeScript interfaces
│   ├── template.ts          # SVG template loader
│   ├── template.svg         # SVG design
│   ├── services/
│   │   ├── github.ts        # GitHub API integration
│   │   └── svg.ts           # SVG rendering
│   └── utils/
│       ├── roles.ts         # Status role logic
│       └── stats.ts         # Stats calculations
├── index.ts                 # Local development server
├── .env                     # Environment variables (not committed)
└── vercel.json             # Vercel configuration
```

## Customization

### Change Status Thresholds
Edit `src/utils/roles.ts` to customize when status modes change.

### Modify Design
Edit `src/template.svg` to customize the card design.

### Add New Stats
1. Add to GraphQL query in `src/services/github.ts`
2. Update rendering in `src/services/svg.ts`

## License

MIT
