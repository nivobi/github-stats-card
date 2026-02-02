import { readFileSync } from "fs";
import { join } from "path";

export function getSvgTemplate(): string {
  return readFileSync(join(__dirname, "template.svg"), "utf-8");
}
