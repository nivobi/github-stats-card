import { serve } from "bun";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "./src/config";
import { getGitHubStats, renderSvg } from "./src/services";
import { getRole, calculateStreak, calculateMonthCommits } from "./src/utils";
import { getSvgTemplate } from "./src/template";

console.log("--------------------------------------------------");
console.log("🚀 GitHub Stats Card Server is running!");
console.log(`👉 Web Interface: http://localhost:${config.server.port}`);
console.log(`👉 API Endpoint: http://localhost:${config.server.port}/api/card`);
console.log(`🔧 Configured user: ${config.github.username}`);
console.log(`🔑 Owner token: ${config.github.token ? 'Yes ✓' : 'No ✗'}`);
console.log(`🔑 Fallback token: ${config.github.fallbackToken ? 'Yes ✓' : 'No ✗'}`);
console.log("--------------------------------------------------");

serve({
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve HTML interface at root
    if (pathname === '/' || pathname === '/index.html') {
      try {
        const html = readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf-8');
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      } catch (error) {
        console.error("❌ Error loading HTML:", error);
        return new Response("Error loading web interface", { status: 500 });
      }
    }

    // Handle favicon request (return empty response to avoid 404)
    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    // Serve SVG card at /api/card
    if (pathname === '/api/card') {
      try {
        const queryUsername = url.searchParams.get('username');
        const username = queryUsername || config.github.username;

        // Validate username format
        if (!/^[a-zA-Z0-9-]+$/.test(username)) {
          return new Response('Invalid username format. Use only letters, numbers, and hyphens.', {
            status: 400
          });
        }

        // Determine which token to use
        const isOwner = username === config.github.username;

        // Use owner's token if this is the owner, otherwise use fallback token if available
        const token = isOwner
          ? config.github.token
          : (config.github.fallbackToken || undefined);

        const authMethod = isOwner
          ? '🔑 owner token'
          : (config.github.fallbackToken ? '🔑 fallback token' : '🌐 unauthenticated REST API');

        console.log(`📥 Fetching data for ${username}... (${authMethod})`);
        const data = await getGitHubStats(username, token);

        const now = new Date();
        const lastPush = new Date(data.lastPush);
        const hoursSincePush = (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60);

        const role = getRole(hoursSincePush);
        const streak = calculateStreak(data.calendar);
        const monthCommits = calculateMonthCommits(data.calendar);

        console.log(`✅ Stats: ${data.totalCommits} commits, Role: ${role.name}`);

        const svgTemplate = getSvgTemplate();
        const svg = renderSvg(svgTemplate, data, role, streak, monthCommits);

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

      } catch (error) {
        console.error("❌ Error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(`Error generating stats card: ${errorMessage}`, { status: 500 });
      }
    }

    // 404 for other paths
    return new Response("Not Found", { status: 404 });
  },
  port: config.server.port,
});
