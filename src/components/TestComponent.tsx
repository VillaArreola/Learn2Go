// src/components/TestComponent.tsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qehmdvzfazkuhyhxubtl.supabase.co", // reemplaza esto
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaG1kdnpmYXprdWh5aHh1YnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjI0MTMsImV4cCI6MjA2NDM5ODQxM30.v6J6jMDCzXr5mBFay7y-VZjRT1hyyir6-9TbO0YwYeo"             // y esto
);

export default function TestComponent() {
  const [message, setMessage] = useState("Cargando...");
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    console.log("📦 TestComponent montado");

    const test = async () => {
      const { data, error } = await supabase.storage.from("podcast-files").list();
      console.log("📦 DATA:", data);
      console.log("⚠️ ERROR:", error);

      if (error) {
        setMessage("❌ Error: " + error.message);
      } else if (data.length === 0) {
        setMessage("✅ Conectado. Bucket vacío.");
      } else {
        setMessage("✅ Archivos:");
        setFiles(data);
      }
    };

    test();
  }, []);

  return (
    <div>
      <h1>🔌 Test Supabase</h1>
      <p>{message}</p>
      <ul>
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>
    </div>
  );
}
