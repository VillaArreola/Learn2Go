import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CreateEpisodeForm() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blockId, setBlockId] = useState("");
  const [blockSlug, setBlockSlug] = useState(""); // Para la ruta del archivo

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number | "">("");
  const [message, setMessage] = useState("");

  // Nombres de archivos
  const [audioPath, setAudioPath] = useState("");
  const [transcriptionPath, setTranscriptionPath] = useState("");
  const [tagsPath, setTagsPath] = useState("");
  const [quizPath, setQuizPath] = useState("");

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

  // Cuando seleccionás un bloque, guardás el slug para formar la ruta
  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = blocks.find((b) => b.id === e.target.value);
    setBlockId(selected?.id || "");
    setBlockSlug(selected?.name || ""); // "name" es tu slug tipo "ia-900"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockId || !title || !chapterNumber || !blockSlug) {
      setMessage("Faltan campos obligatorios.");
      return;
    }

    // Insertar episodio
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

    const episodeId = inserted.id;

    // Archivos esperados
    const rutaBase = `/podcast/${blockSlug}/capitulo${chapterNumber}`;
    const filesToRegister = [
      { name: audioPath, type: "audio" },
      { name: transcriptionPath, type: "transcription" },
      { name: tagsPath, type: "tags" },
      { name: quizPath, type: "quiz" },
    ];

    for (const { name, type } of filesToRegister) {
      if (!name) continue;

      const filePath = `${rutaBase}/${name}`;

      await supabase.from("podcast_files").insert([
        {
          episode_id: episodeId,
          file_type: type,
          file_path: filePath,
          file_name: name,
          file_size: 0,
          mime_type: "", // opcional
        },
      ]);
    }

    setMessage("✅ Episodio guardado con rutas locales.");
    // Limpiar
    setBlockId("");
    setBlockSlug("");
    setTitle("");
    setDescription("");
    setDuration("");
    setCategory("");
    setChapterNumber("");
    setAudioPath("");
    setTranscriptionPath("");
    setTagsPath("");
    setQuizPath("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <select className="border p-2 rounded" value={blockId} onChange={handleBlockChange}>
        <option value="">Selecciona un bloque</option>
        {blocks.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Número de capítulo"
        className="border p-2 rounded"
        value={chapterNumber}
        onChange={(e) => setChapterNumber(Number(e.target.value))}
      />

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
        placeholder="Duración (ej: 15:30)"
        className="border p-2 rounded"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <input
        type="text"
        placeholder="Categoría (opcional)"
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <h3 className="font-semibold mt-4">Archivos en /public/podcast/{blockSlug}/capitulo{chapterNumber}/</h3>

      <input
        type="text"
        placeholder="audio.mp3"
        className="border p-2 rounded"
        value={audioPath}
        onChange={(e) => setAudioPath(e.target.value)}
      />

      <input
        type="text"
        placeholder="transcription.txt"
        className="border p-2 rounded"
        value={transcriptionPath}
        onChange={(e) => setTranscriptionPath(e.target.value)}
      />

      <input
        type="text"
        placeholder="tags.txt"
        className="border p-2 rounded"
        value={tagsPath}
        onChange={(e) => setTagsPath(e.target.value)}
      />

      <input
        type="text"
        placeholder="quiz.txt"
        className="border p-2 rounded"
        value={quizPath}
        onChange={(e) => setQuizPath(e.target.value)}
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Crear Episodio con rutas locales
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
