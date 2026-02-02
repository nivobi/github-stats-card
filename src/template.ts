import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export function getSvgTemplate(): string {
  try {
    // Try ES module path resolution first
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    return readFileSync(join(__dirname, "template.svg"), "utf-8");
  } catch {
    // Fallback to process.cwd() for Vercel environment
    return readFileSync(join(process.cwd(), "src", "template.svg"), "utf-8");
  }
}
