"use server";

import { prisma } from "@/lib/db";
import { generateProgramTargets } from "@/lib/engine/program-generator";
import { auth } from "@/auth";
import { BodyShape, Gender, UnitSystem, UserProfile } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation des données reçues du frontend
const onboardingSchema = z.object({
  gender: z.nativeEnum(Gender),
  age: z.coerce.number().min(10).max(100), // coerce transforme les strings "25" en number 25
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(30).max(300),
  currentShape: z.nativeEnum(BodyShape),
  goalShape: z.nativeEnum(BodyShape),
  weeklyWorkoutDays: z.coerce.number().min(1).max(7),
});

export async function submitOnboarding(formData: FormData) {
  // 1. Vérifier que l'utilisateur est connecté
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non autorisé" };
  }

  // 2. Parser et valider les données du formulaire
  const rawData = {
    gender: formData.get("gender"),
    age: formData.get("age"),
    height: formData.get("height"),
    weight: formData.get("weight"),
    currentShape: formData.get("currentShape"),
    goalShape: formData.get("goalShape"),
    weeklyWorkoutDays: formData.get("weeklyWorkoutDays"),
  };

  const validation = onboardingSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: "Données invalides. Vérifiez tous les champs." };
  }

  const data = validation.data;
  
  // Calcul approximatif de la date de naissance (pour le moteur qui attend une date)
  const estimatedBirthDate = new Date();
  estimatedBirthDate.setFullYear(estimatedBirthDate.getFullYear() - data.age);

  try {
    // 3. Simulation de l'objet UserProfile pour le moteur
    // (On triche un peu car on n'a pas encore l'objet DB, mais on a les infos nécessaires)
    const profileForEngine = {
      ...data,
      birthDate: estimatedBirthDate,
      unitSystem: UnitSystem.METRIC,
      id: "temp",
      userId: session.user.id,
      targetWeight: null,
      bodyFat: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserProfile;

    // 4. APPEL DU MOTEUR (Le code qu'on a testé tout à l'heure !)
    const programTargets = generateProgramTargets(profileForEngine);

    // 5. Sauvegarde Transactionnelle (Tout ou rien)
    await prisma.$transaction(async (tx) => {
      // A. Sauvegarder le profil physique
      await tx.userProfile.create({
        data: {
          userId: session.user.id!,
          gender: data.gender,
          birthDate: estimatedBirthDate,
          height: data.height,
          weight: data.weight,
          currentShape: data.currentShape,
          goalShape: data.goalShape,
          weeklyWorkoutDays: data.weeklyWorkoutDays,
        },
      });

      // B. Sauvegarder le programme généré
      await tx.program.create({
        data: {
          userId: session.user.id!,
          dailyCalories: programTargets.dailyCalories,
          dailySteps: programTargets.dailySteps,
          weeklyResistanceSessions: programTargets.weeklyResistanceSessions,
          focus: programTargets.focus,
        },
      });
    });

  } catch (error) {
    console.error("Erreur onboarding:", error);
    return { error: "Erreur lors de la création du programme." };
  }

  // 6. Redirection vers le dashboard
  redirect("/dashboard");
}