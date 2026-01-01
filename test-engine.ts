// test-engine.ts
// Ce script simule des profils et affiche le programme généré.

import { generateProgramTargets } from "./lib/engine/program-generator";
import { Gender, BodyShape, UnitSystem } from "@prisma/client";

// Simulation d'un profil : Homme, 30 ans, 90kg, 180cm
// Veut passer de Silhouette 5 (Gras) à 3 (Athlétique)
const mockProfile = {
  id: "test",
  userId: "test",
  gender: Gender.MALE,
  birthDate: new Date("1994-01-01"), // 30 ans environ
  weight: 90,
  height: 180,
  unitSystem: UnitSystem.METRIC,
  currentShape: BodyShape.SHAPE_5,
  goalShape: BodyShape.SHAPE_3,
  weeklyWorkoutDays: 4,
  // Champs techniques obligatoires pour le type UserProfile mais inutiles ici
  targetWeight: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  bodyFat: null
};

console.log("--- TEST MOTEUR V1 ---");
console.log(`Profil : Homme, 90kg, Shape 5 -> 3`);
console.log(`Engagement : 4 séances/semaine`);

const result = generateProgramTargets(mockProfile);

console.log("\n--- RÉSULTAT GÉNÉRÉ ---");
console.log(`Focus : ${result.focus}`);
console.log(`Calories : ${result.dailyCalories} kcal/jour`);
console.log(`Pas : ${result.dailySteps} pas/jour`);
console.log(`Séances : ${result.weeklyResistanceSessions} /semaine`);