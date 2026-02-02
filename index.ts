import { serve } from "bun";
import { config } from "./src/config";
import { getGitHubStats, renderSvg } from "./src/services";
import { getRole, calculateStreak, calculateMonthCommits } from "./src/utils";
import { getSvgTemplate } from "./src/template";

console.log("--------------------------------------------------");
console.log("🚀 Goblin Server (CSS Fix) is running!");
console.log(`👉 Go to: http://localhost:${config.server.port}`);
console.log(`🔧 Configured user: ${config.github.username}`);
console.log(`🔑 Token loaded: ${config.github.token ? 'Yes' : 'No'}`);
console.log("--------------------------------------------------");

serve({
  async fetch(req) {
    try {
      console.log(`📥 Fetching real data for ${config.github.username}...`);
      const data = await getGitHubStats(config.github.username, config.github.token);

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
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

    } catch (error) {
      console.error("❌ Error:", error);
      return new Response("Error fetching stats. Check terminal.", { status: 500 });
    }
  },
  port: config.server.port,
});
