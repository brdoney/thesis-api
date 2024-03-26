import fs from "node:fs/promises";

export async function readMap(path) {
  try {
    const file = await fs.readFile(path);
    const json = JSON.parse(file);
    return new Map(Object.entries(json));
  } catch (e) {
    if (e.code === "ENOENT") {
      // Create the file
      await fs.writeFile(path, "{}");
      return new Map();
    } else {
      throw e;
    }
  }
}

export async function writeMap(path, map) {
  await fs.writeFile(path, JSON.stringify(Object.fromEntries(map)));
}

export function maxMapId(userMap) {
  // Default to 0 if no one is in user map yet
  return Math.max(0, ...userMap.values());
}
