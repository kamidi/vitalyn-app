"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logWorkout() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non connecté" };

  const userId = session.user.id;
  
  // 1. Définir "Aujourd'hui" (sans l'heure, pour éviter les doublons)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    // On utilise une transaction pour que Log + Points + User soient synchronisés
    await prisma.$transaction(async (tx) => {
      
      // A. Vérifier si déjà fait aujourd'hui
      const existingLog = await tx.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: userId,
            date: today,
          },
        },
      });

      if (existingLog?.workoutDone) {
        throw new Error("Séance déjà validée pour aujourd'hui !");
      }

      // B. Créer ou mettre à jour le DailyLog
      await tx.dailyLog.upsert({
        where: { userId_date: { userId, date: today } },
        update: { workoutDone: true, isSuccess: true },
        create: {
          userId,
          date: today,
          workoutDone: true,
          isSuccess: true, // Pour la V1, faire sa séance = succès
          stepsCount: 0,
          activeCalories: 0,
        },
      });

      // C. Ajouter les points (Récompense)
      const REWARD_POINTS = 10;

      await tx.pointTransaction.create({
        data: {
          userId,
          amount: REWARD_POINTS,
          reason: "WORKOUT_COMPLETE",
          description: "Séance validée",
        },
      });

      // D. Mettre à jour le solde de l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: {
          currentPoints: {
            increment: REWARD_POINTS,
          },
        },
      });
    });

    // 2. Rafraîchir l'interface pour afficher les nouveaux points
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error: any) {
    console.error("Erreur tracking:", error);
    // On renvoie l'erreur proprement au client
    return { error: error.message || "Erreur serveur" };
  }
}