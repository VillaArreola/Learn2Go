import { useEffect, useState } from "react";
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

  const [audio, setAudio] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<File | null>(null);
  const [tags, setTags] = useState<File | null>(null);
  const [quiz, setQuiz] = useState<File | null>(null);

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
      setMessage("⚠️ Faltan campos obligatorios.");
      return;
    }

    // 1. Insertar episodio
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
      setMessage(`❌ Error al guardar episodio: ${error?.message}`);
      return;
    }

    const form = new FormData();
    form.append("slug", blockSlug);
    form.append("chapter", chapterNumber.toString());
    if (audio) form.append("audio", audio);
    if (transcription) form.append("transcription", transcription);
    if (tags) form.append("tags", tags);
    if (quiz) form.append("quiz", quiz);

    // 2. Subir archivos
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!uploadRes.ok) {
      setMessage("❌ Error al subir archivos.");
      return;
    }

    setMessage("✅ Episodio y archivos guardados con éxito.");
    setTitle("");
    setDescription("");
    setDuration("");
    setCategory("");
    setChapterNumber("");
    setAudio(null);
    setTranscription(null);
    setTags(null);
    setQuiz(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <select value={blockId} onChange={handleBlockChange} required>
        <option value="">Selecciona un bloque</option>
        {blocks.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Título del episodio"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Duración (ej: 12:34)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <input
        type="text"
        placeholder="Categoría"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        type="number"
        placeholder="Capítulo (número)"
        value={chapterNumber}
        onChange={(e) => setChapterNumber(parseInt(e.target.value))}
        required
      />

      <label>Audio (MP3):</label>
      <input type="file" accept=".mp3" onChange={(e) => setAudio(e.target.files?.[0] || null)} />

      <label>Transcripción (.txt):</label>
      <input type="file" accept=".txt" onChange={(e) => setTranscription(e.target.files?.[0] || null)} />

      <label>Tags (.txt):</label>
      <input type="file" accept=".txt" onChange={(e) => setTags(e.target.files?.[0] || null)} />

      <label>Quiz (.txt):</label>
      <input type="file" accept=".txt" onChange={(e) => setQuiz(e.target.files?.[0] || null)} />

      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Crear episodio y subir archivos
      </button>

      <p className="text-sm text-green-600">{message}</p>
    </form>
  );
}
