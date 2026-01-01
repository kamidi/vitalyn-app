"use client";

import { submitOnboarding } from "@/actions/onboarding-actions";
import { useState, useTransition } from "react";

// Les silhouettes disponibles
const SHAPES = [
  { id: "SHAPE_1", label: "1. Très Mince", desc: "Peu de graisse, peu de muscle" },
  { id: "SHAPE_2", label: "2. Mince", desc: "Légèrement défini" },
  { id: "SHAPE_3", label: "3. Athlétique", desc: "Musclé et sec" },
  { id: "SHAPE_4", label: "4. Costaud", desc: "Musclé avec un peu de gras" },
  { id: "SHAPE_5", label: "5. Rond", desc: "Surpoids visible" },
  { id: "SHAPE_6", label: "6. Très Rond", desc: "Surpoids important" },
];

export default function OnboardingForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Pour gérer l'affichage de la valeur sélectionnée (UX)
  const [currentShape, setCurrentShape] = useState("SHAPE_3");
  const [goalShape, setGoalShape] = useState("SHAPE_3");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await submitOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      
      {/* SECTION 1 : BIO */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">1. Vos Données</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Sexe</label>
            <select name="gender" className="mt-1 block w-full rounded-md border border-gray-300 p-2">
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Âge (ans)</label>
            <input type="number" name="age" defaultValue="30" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
            <input type="number" name="weight" defaultValue="80" step="0.1" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
            <input type="number" name="height" defaultValue="175" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>
        </div>
      </div>

      {/* SECTION 2 : ÉTAT ACTUEL */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">2. Votre Silhouette Actuelle</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHAPES.map((shape) => (
            <label 
              key={shape.id} 
              className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex flex-col items-center text-center ${currentShape === shape.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              <input 
                type="radio" 
                name="currentShape" 
                value={shape.id} 
                className="sr-only" 
                onChange={() => setCurrentShape(shape.id)}
                defaultChecked={shape.id === "SHAPE_3"}
              />
              <span className="font-bold text-sm block">{shape.label}</span>
              <span className="text-xs text-gray-500">{shape.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 3 : OBJECTIF */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">3. Votre Objectif</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHAPES.map((shape) => (
            <label 
              key={`goal-${shape.id}`} 
              className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex flex-col items-center text-center ${goalShape === shape.id ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            >
              <input 
                type="radio" 
                name="goalShape" 
                value={shape.id} 
                className="sr-only" 
                onChange={() => setGoalShape(shape.id)}
                defaultChecked={shape.id === "SHAPE_3"}
              />
              <span className="font-bold text-sm block">{shape.label}</span>
              <span className="text-xs text-gray-500">{shape.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 4 : ENGAGEMENT */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">4. Engagement Sportif</h3>
        <p className="text-sm text-gray-500 mb-2">Combien de séances de renforcement pouvez-vous faire par semaine ?</p>
        <div className="flex items-center space-x-4">
          <input 
            type="range" 
            name="weeklyWorkoutDays" 
            min="1" 
            max="7" 
            defaultValue="3" 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            onInput={(e) => {
              const span = document.getElementById('days-display');
              if(span) span.innerText = (e.target as HTMLInputElement).value;
            }}
          />
          <span className="font-bold text-xl w-8 text-center" id="days-display">3</span>
          <span className="text-gray-500">jours/sem</span>
        </div>
      </div>

      {/* ERREURS ET SUBMIT */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? "Génération du programme..." : "Valider et Calculer mon Programme"}
        </button>
      </div>
    </form>
  );
}