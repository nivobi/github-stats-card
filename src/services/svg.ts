import type { GitHubStats, Role, Streak } from "../types.js";
import { ICONS } from "../config.js";

export function renderSvg(
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
  setText("role_desc", role.desc);
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
