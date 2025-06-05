import React from "react";

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  chapter_number: number;
}

interface File {
  episode_id: string;
  file_type: string;
  file_path: string;
}

interface Props {
  episodes: Episode[];
  files: File[];
}

export default function PlayerList({ episodes, files }: Props) {
  return (
    <div className="space-y-6">
      {episodes.map((ep) => {
        const audio = files.find(f => f.episode_id === ep.id && f.file_type === "audio");
        const transcript = files.find(f => f.episode_id === ep.id && f.file_type === "transcription");

        return (
          <div key={ep.id} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold">
              {ep.chapter_number}. {ep.title}
            </h2>
            <p className="text-sm text-gray-600 mb-2">{ep.description}</p>
            <p className="text-sm text-gray-500 mb-2">Duración: {ep.duration}</p>

            {audio && (
              <audio controls className="w-full mb-2">
                <source src={audio.file_path} type="audio/mpeg" />
              </audio>
            )}

            {transcript && (
              <a
                href={transcript.file_path}
                target="_blank"
                className="text-blue-600 underline"
              >
                Ver transcripción
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
