"use server"; // Indispensable pour dire que ça tourne sur le serveur


import { prisma } from "@/lib/db"; // <--- AJOUTE CECI
import bcrypt from "bcryptjs";
import { z } from "zod";




// Schéma de validation
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerUser(formData: FormData) {
  // 1. Récupération et validation des données
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = registerSchema.safeParse({ name, email, password });

  if (!validatedFields.success) {
    return { success: false, error: "Champs invalides" };
  }

  // 2. Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "Cet email est déjà utilisé." };
  }

  // 3. Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Création de l'utilisateur + Initialisation des points
  try {
    await prisma.$transaction(async (tx) => {
      // Créer User
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          currentPoints: 100, // Capital de départ
        },
      });

      // Créer la première transaction (Bonus bienvenue)
      await tx.pointTransaction.create({
        data: {
          userId: newUser.id,
          amount: 100,
          reason: "WELCOME_BONUS",
          description: "Bienvenue sur Vitalyn !",
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur inscription:", error);
    return { success: false, error: "Erreur serveur lors de l'inscription." };
  }
}


// ... (imports existants)
import { signIn } from "@/auth"; // Assure-toi que cet import pointe vers ton fichier auth.ts à la racine
import { AuthError } from "next-auth";

// ... (fonction registerUser existante)

export async function loginAction(formData: FormData) {
  try {
    // Tente de se connecter avec Auth.js
    // On ne met pas de "redirect: false" car on veut que le serveur redirige
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard", // Redirection après succès
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email ou mot de passe incorrect." };
        default:
          return { error: "Erreur lors de la connexion." };
      }
    }
    // Important : Next.js utilise des erreurs pour les redirections, il faut les laisser passer
    throw error;
  }
}