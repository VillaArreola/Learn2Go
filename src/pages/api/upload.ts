// src/pages/api/upload.ts
import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const slug = formData.get("slug")?.toString();
  const chapter = formData.get("chapter")?.toString();

  if (!slug || !chapter) {
    return new Response("Faltan datos", { status: 400 });
  }

  const baseDir = path.resolve(`./public/podcast/${slug}/capitulo${chapter}`);
  fs.mkdirSync(baseDir, { recursive: true });

  const fileFields = ["audio", "transcription", "tags", "quiz"];

  for (const field of fileFields) {
    const file = formData.get(field) as File;
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(baseDir, file.name);
      fs.writeFileSync(filePath, buffer);
    }
  }

  return new Response("Archivos subidos", { status: 200 });
};
