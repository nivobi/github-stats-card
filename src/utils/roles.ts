import type { Role } from "../types";

export function getRole(hours: number): Role {
  if (hours <= 2) return { key: "goblin", name: "Full-on Goblin Mode", desc: "Writing code faster than I can think." };
  if (hours <= 12) return { key: "human", name: "Productive Human", desc: "Caffeine levels stable. Systems operational." };
  if (hours <= 24) return { key: "grass", name: "Touching Grass", desc: "Outside... what is that bright light?" };
  if (hours <= 48) return { key: "caffeine", name: "Caffeine Critical", desc: "System shutting down. Send coffee." };
  if (hours <= 168) return { key: "hibernate", name: "Hibernating", desc: "Recharging neural networks." };
  return { key: "ancient", name: "Ancient One", desc: "Last seen eons ago..." };
}
