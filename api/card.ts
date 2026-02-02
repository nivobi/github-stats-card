import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGitHubStats, renderSvg } from '../src/services';
import { getRole, calculateStreak, calculateMonthCommits } from '../src/utils';
import { getSvgTemplate } from '../src/template';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const username = process.env.GITHUB_USERNAME || '';
    const token = process.env.GITHUB_TOKEN || '';

    console.log('Environment check:', {
      hasUsername: !!username,
      hasToken: !!token,
      username: username
    });

    if (!username || !token) {
      return res.status(500).send('Missing GITHUB_USERNAME or GITHUB_TOKEN environment variables');
    }

    console.log('Fetching GitHub stats...');
    const data = await getGitHubStats(username, token);
    console.log('Stats fetched successfully');

    const now = new Date();
    const lastPush = new Date(data.lastPush);
    const hoursSincePush = (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60);

    const role = getRole(hoursSincePush);
    const streak = calculateStreak(data.calendar);
    const monthCommits = calculateMonthCommits(data.calendar);

    console.log('Loading SVG template...');
    const svgTemplate = getSvgTemplate();
    console.log('Template loaded, size:', svgTemplate.length);

    console.log('Rendering SVG...');
    const svg = renderSvg(svgTemplate, data, role, streak, monthCommits);
    console.log('SVG rendered successfully');

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 min cache
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).send(`Error generating stats card: ${errorMessage}`);
  }
}
