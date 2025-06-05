import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CreateEpisodeForm() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blockId, setBlockId] = useState("");
  const [blockSlug, setBlockSlug] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number | "">("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlocks = async () => {
      const { data } = await supabase
        .from("podcast_blocks")
        .select("id, name, title")
        .order("created_at", { ascending: false });

      if (data) setBlocks(data);
    };

    fetchBlocks();
  }, []);

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = blocks.find((b) => b.id === e.target.value);
    setBlockId(selected?.id || "");
    setBlockSlug(selected?.name || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockId || !title || !chapterNumber || !blockSlug) {
      setMessage("Faltan campos obligatorios.");
      return;
    }

    // 1. Subir archivos localmente vía API
    const formData = new FormData();
    formData.append("slug", blockSlug);
    formData.append("chapter", String(chapterNumber));

    const audioFile = (document.querySelector("input[name='audio']") as HTMLInputElement)?.files?.[0];
    const transcriptionFile = (document.querySelector("input[name='transcription']") as HTMLInputElement)?.files?.[0];
    const tagsFile = (document.querySelector("input[name='tags']") as HTMLInputElement)?.files?.[0];
    const quizFile = (document.querySelector("input[name='quiz']") as HTMLInputElement)?.files?.[0];

    if (audioFile) formData.append("audio", audioFile);
    if (transcriptionFile) formData.append("transcription", transcriptionFile);
    if (tagsFile) formData.append("tags", tagsFile);
    if (quizFile) formData.append("quiz", quizFile);

    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) {
      setMessage("❌ Error al subir archivos");
      return;
    }

    // 2. Guardar episodio en Supabase
    const { data: inserted, error } = await supabase
      .from("podcast_episodes")
      .insert([
        {
          block_id: blockId,
          title,
          description,
          duration,
          category,
          chapter_number: chapterNumber,
        },
      ])
      .select()
      .single();

    if (error || !inserted) {
      setMessage("❌ Error al guardar episodio");
      return;
    }

    const episodeId = inserted.id;
    const rutaBase = `/podcast/${blockSlug}/capitulo${chapterNumber}`;

    const filesToRegister = [
      { file: audioFile, type: "audio" },
      { file: transcriptionFile, type: "transcription" },
      { file: tagsFile, type: "tags" },
      { file: quizFile, type: "quiz" },
    ];

    for (const { file, type } of filesToRegister) {
      if (!file) continue;
      await supabase.from("podcast_files").insert([
        {
          episode_id: episodeId,
          file_type: type,
          file_path: `${rutaBase}/${file.name}`,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        },
      ]);
    }

    setMessage("✅ Episodio y archivos guardados correctamente");

    // Limpiar
    setBlockId("");
    setBlockSlug("");
    setTitle("");
    setDescription("");
    setDuration("");
    setCategory("");
    setChapterNumber("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Crear nuevo episodio</h2>

      <select value={blockId} onChange={handleBlockChange} className="border p-2 rounded">
        <option value="">-- Selecciona un bloque --</option>
        {blocks.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Título del episodio"
        className="border p-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Descripción"
        className="border p-2 rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="Duración (ej: 12:30)"
        className="border p-2 rounded"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <input
        type="text"
        placeholder="Categoría"
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        type="number"
        placeholder="Número de capítulo"
        className="border p-2 rounded"
        value={chapterNumber}
        onChange={(e) => setChapterNumber(Number(e.target.value))}
      />

      <label className="font-semibold">Archivos:</label>
      <input name="audio" type="file" accept=".mp3" />
      <input name="transcription" type="file" accept=".txt" />
      <input name="tags" type="file" accept=".txt" />
      <input name="quiz" type="file" accept=".txt" />

      <button type="submit" className="bg-blue-600 text-white py-2 rounded">
        Guardar episodio
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
