import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CreateBlockForm() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const [blocks, setBlocks] = useState<any[]>([]); // Lista de bloques existentes

  // Cargar los bloques existentes al iniciar
  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    const { data, error } = await supabase
      .from("podcast_blocks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error al consultar bloques:", error.message);
    } else {
      setBlocks(data || []);
      console.log("📦 Bloques existentes:", data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug || !title) {
      setMessage("Faltan campos obligatorios.");
      return;
    }

    const { error } = await supabase.from("podcast_blocks").insert([
      {
        name: slug,
        title,
        description,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("✅ ¡Bloque creado con éxito!");
      setSlug("");
      setTitle("");
      setDescription("");
      fetchBlocks(); // Actualiza la lista
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="ej: ia-900"
          className="border p-2 rounded"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          type="text"
          placeholder="ej: Curso de IA 900"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descripción del bloque (opcional)"
          className="border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Bloque
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>

      {/* Lista de bloques */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Bloques existentes</h2>
        {blocks.length === 0 && <p>No hay bloques aún.</p>}
        <ul className="space-y-2">
          {blocks.map((block) => (
            <li key={block.id} className="border p-3 rounded shadow bg-white">
              <strong>{block.title}</strong> <span className="text-sm text-gray-500">({block.name})</span>
              <p className="text-gray-700">{block.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
