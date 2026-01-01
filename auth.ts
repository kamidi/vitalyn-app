import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// SUPPRIME CETTE LIGNE : import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db"; // <--- AJOUTE CECI (import de notre singleton)
import bcrypt from "bcryptjs";
import { z } from "zod";

// On instancie Prisma juste pour l'auth


// Schéma de validation pour les inputs
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // Le nom affiché (optionnel)
      name: "credentials",
      // Les champs nécessaires (utilisé pour générer l'UI par défaut de debug)
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // La logique de vérification
      authorize: async (credentials) => {
        try {
          // 1. Validation des données entrantes
          const { email, password } = await loginSchema.parseAsync(credentials);

          // 2. Recherche de l'utilisateur en DB
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null; // Pas d'user trouvé
          }

          // 3. Comparaison du mot de passe
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

          if (!passwordsMatch) return null;

          // 4. Succès : on retourne l'objet user (sans le mot de passe)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // On propagera ça dans la session plus tard
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  // Callbacks pour ajouter des infos à la session (ex: ID utilisateur, Rôle)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore // On règle le typage plus tard
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // On créera cette page perso plus tard
  },
  session: {
    strategy: "jwt", // Obligatoire avec Credentials
  },
});