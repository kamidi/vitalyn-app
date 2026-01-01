"use client";

import { logWorkout } from "@/actions/tracking-actions";
import { useTransition, useState } from "react";

export default function WorkoutButton({ isDoneToday }: { isDoneToday: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      const result = await logWorkout();
      
      if (result.error) {
        setMsg(`❌ ${result.error}`);
      } else {
        setMsg("🎉 Bien joué ! +10 points");
      }
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMsg(null), 3000);
    });
  };

  if (isDoneToday) {
    return (
      <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 cursor-default">
        ✅ Séance validée pour aujourd'hui
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white sm:text-sm transition-colors
          ${isPending 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
      >
        {isPending ? "Validation..." : "Valider ma séance (+10 pts)"}
      </button>
      
      {msg && <p className="text-sm font-medium animate-pulse">{msg}</p>}
    </div>
  );
}