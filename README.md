# GitHub Stats Card

A dynamic SVG card that displays your GitHub statistics with different status modes based on your activity.

![Preview](https://via.placeholder.com/450x180?text=Your+GitHub+Stats+Card)

## Features

- **Dynamic Status Modes**: Changes based on your last push
  - 🧌 Goblin Mode (< 2 hours)
  - 👤 Productive Human (< 12 hours)
  - 🌱 Touching Grass (< 24 hours)
  - ☕ Caffeine Critical (< 48 hours)
  - 😴 Hibernating (< 1 week)
  - ⏳ Ancient One (> 1 week)
- **GitHub Stats**: Total commits, monthly commits, current streak
- **Languages**: Displays your most used and recently used languages
- **Live Updates**: Updates every 5 minutes with fresh data from GitHub

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
PORT=3000
```

4. Run locally
```bash
bun run dev
```

5. Visit `http://localhost:3000` to see your card

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Deploying to Vercel
- Adding the card to your GitHub profile
- Troubleshooting

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/github-stats-card)

Remember to set environment variables in Vercel:
- `GITHUB_TOKEN`
- `GITHUB_USERNAME`

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
