import { UserProfile, Gender, BodyShape } from "@prisma/client";

// Types de retour pour notre fonction
export interface ProgramTargets {
  dailyCalories: number;
  dailySteps: number;
  weeklyResistanceSessions: number;
  focus: string; // Ex: "Perte de gras", "Prise de muscle"
}

/**
 * MOTEUR DÉTERMINISTE V1
 * Transforme un profil utilisateur en objectifs concrets.
 */
export function generateProgramTargets(profile: UserProfile): ProgramTargets {
  // 1. Calcul du BMR (Basal Metabolic Rate) - Formule Mifflin-St Jeor
  // C'est l'énergie brûlée au repos complet.
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * calculateAge(profile.birthDate);

  if (profile.gender === Gender.MALE) {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Estimation de la Dépense Énergétique Totale (TDEE)
  // On utilise un multiplicateur basique car on ne connait pas encore l'activité non-sportive (NEAT).
  // On suppose "Sédentaire" par défaut pour ne pas surestimer (x1.2).
  let tdee = bmr * 1.2;

  // 3. Ajout de l'activité sportive déclarée (Engagement)
  // Chaque séance ajoute environ 250kcal de dépense moyenne lissée sur la semaine
  const workoutCaloriesFactor = (profile.weeklyWorkoutDays * 250) / 7;
  tdee += workoutCaloriesFactor;

  // 4. Analyse des Silhouettes (Le Delta)
  // On compare la forme actuelle (1-6) à l'objectif (1-6)
  const shapeDelta = getShapeValue(profile.goalShape) - getShapeValue(profile.currentShape);
  
  // 5. Définition de l'objectif calorique et du focus
  let targetCalories = tdee;
  let focus = "Maintien";
  let stepTarget = 6000; // Base pour la santé

  if (shapeDelta < 0) {
    // CAS : Perte de poids (On veut aller vers une silhouette plus basse, ex: 5 -> 3)
    focus = "Perte de gras";
    
    // Déficit calorique modéré (-300 à -500 kcal)
    // Plus on a de poids à perdre (Delta grand), plus le déficit peut être agressif, sans descendre sous BMR.
    const deficit = Math.min(500, Math.abs(shapeDelta) * 150 + 200);
    targetCalories = tdee - deficit;

    // On augmente les pas pour brûler plus sans fatigue nerveuse
    stepTarget = 8000 + (Math.abs(shapeDelta) * 1000); // Ex: Delta -2 => 10,000 pas

  } else if (shapeDelta > 0) {
    // CAS : Prise de masse (On veut aller vers une silhouette plus haute, ex: 2 -> 3)
    focus = "Prise de muscle";
    
    // Surplus calorique léger (+200 à +300 kcal) pour minimiser le gras
    const surplus = 200 + (shapeDelta * 50);
    targetCalories = tdee + surplus;
    
    // Pas modérés pour ne pas brûler trop de calories
    stepTarget = 6000; 

  } else {
    // CAS : Recomposition (Même silhouette mais plus fit)
    focus = "Recomposition corporelle";
    targetCalories = tdee; // Maintien
    stepTarget = 8000;
  }

  // Sécurité : Ne jamais descendre trop bas (V1 santé avant tout)
  const minCalories = profile.gender === Gender.MALE ? 1500 : 1200;
  if (targetCalories < minCalories) targetCalories = minCalories;

  return {
    dailyCalories: Math.round(targetCalories),
    dailySteps: Math.min(12000, stepTarget), // Cap à 12k pour V1 (réalisable)
    weeklyResistanceSessions: profile.weeklyWorkoutDays, // On respecte l'engagement utilisateur
    focus: focus
  };
}

// --- UTILITAIRES ---

function calculateAge(birthDate: Date): number {
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Convertit l'enum BodyShape en chiffre exploitable (1 à 6)
function getShapeValue(shape: BodyShape): number {
  switch (shape) {
    case BodyShape.SHAPE_1: return 1;
    case BodyShape.SHAPE_2: return 2;
    case BodyShape.SHAPE_3: return 3;
    case BodyShape.SHAPE_4: return 4;
    case BodyShape.SHAPE_5: return 5;
    case BodyShape.SHAPE_6: return 6;
    default: return 3;
  }
}