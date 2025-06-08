import { supabase } from "../../lib/supabase";

export async function POST({ request }: { request: Request }) {
  try {
    const form = await request.formData();

    const slug = form.get("slug");
    const chapter = form.get("chapter");

    if (!slug || !chapter || typeof slug !== "string" || typeof chapter !== "string") {
      return new Response("❌ Faltan datos del episodio.", { status: 400 });
    }

    const basePath = `${slug}/capitulo${chapter}`;

    const files: { key: string; file: File | null }[] = [
      { key: "audio", file: form.get("audio") as File },
      { key: "transcription", file: form.get("transcription") as File },
      { key: "tags", file: form.get("tags") as File },
      { key: "quiz", file: form.get("quiz") as File },
    ];

    const uploadResults = [];

    for (const { key, file } of files) {
      if (!file || typeof file === "string") continue;

      const filePath = `${basePath}/${file.name}`;

      const { error } = await supabase
        .storage
        .from("podcast-files")
        .upload(filePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        console.error(`❌ Error al subir ${key}:`, error.message);
        return new Response(`Error al subir ${key}`, { status: 500 });
      }

      uploadResults.push(filePath);
    }

    return new Response(JSON.stringify({
      message: "✅ Archivos subidos correctamente",
      files: uploadResults,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Error en upload:", err);
    return new Response("Error interno", { status: 500 });
  }
}
