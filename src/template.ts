import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export function getSvgTemplate(): string {
  const paths = [
    // Try ES module path resolution first
    (() => {
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        return join(__dirname, "template.svg");
      } catch {
        return null;
      }
    })(),
    // Fallback paths for different environments
    join(process.cwd(), "src", "template.svg"),
    join(process.cwd(), "template.svg"),
    join(__dirname, "template.svg"),
  ].filter(Boolean) as string[];

  for (const path of paths) {
    console.log('Trying path:', path, 'exists:', existsSync(path));
    if (existsSync(path)) {
      return readFileSync(path, "utf-8");
    }
  }

  throw new Error(`Template file not found. Tried paths: ${paths.join(', ')}`);
}
