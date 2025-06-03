import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CreateEpisodeForm() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blockId, setBlockId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number | "">("");
  const [message, setMessage] = useState("");

  // Cargar bloques para seleccionar a cuál pertenece el episodio
  useEffect(() => {
    const fetchBlocks = async () => {
      const { data, error } = await supabase
        .from("podcast_blocks")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (!error) setBlocks(data || []);
    };

    fetchBlocks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockId || !title || !chapterNumber) {
      setMessage("Completa los campos obligatorios.");
      return;
    }

    const { error } = await supabase.from("podcast_episodes").insert([
      {
        block_id: blockId,
        title,
        description,
        duration,
        category,
        chapter_number: chapterNumber,
      },
    ]);

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage("✅ Episodio creado con éxito");
      // Limpiar campos
      setBlockId("");
      setTitle("");
      setDescription("");
      setDuration("");
      setCategory("");
      setChapterNumber("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <select
        className="border p-2 rounded"
        value={blockId}
        onChange={(e) => setBlockId(e.target.value)}
      >
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
        placeholder="Descripción (opcional)"
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

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Crear Episodio
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
