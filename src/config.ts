export const config = {
  github: {
    token: process.env.GITHUB_TOKEN || "",
    username: process.env.GITHUB_USERNAME || "",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
};

export const ICONS: Record<string, string> = {
  goblin: "icon_goblin",
  human: "icon_human",
  caffeine: "icon_caffeine",
  grass: "icon_grass",
  hibernate: "icon_hibernate",
  ancient: "icon_ancient"
};
