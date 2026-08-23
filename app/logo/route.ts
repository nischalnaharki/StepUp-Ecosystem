import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const file = await readFile(path.join(process.cwd(), "channelspfp (98x98 pixel).jpg"));
  return new Response(file, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" } });
}
