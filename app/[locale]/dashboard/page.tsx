import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkoutButton from "@/components/dashboard/workout-button";

export default async function DashboardPage() {
  // 1. Vérification de sécurité
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 2. Définir la date d'aujourd'hui à 00:00:00 (pour matcher la DB)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // 3. Récupération des données en parallèle (User, Programme, Log du jour)
  const [user, program, dailyLog] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: session.user.id },
      select: { name: true, currentPoints: true } 
    }),
    prisma.program.findUnique({ 
      where: { userId: session.user.id } 
    }),
    prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    })
  ]);

  // 4. Redirections si données manquantes
  if (!program) redirect("/onboarding");
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user.name || "Athlète"}
          </h1>
          
          {/* Bouton de déconnexion (Server Action inline) */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-sm text-gray-500 hover:text-red-600 font-medium">
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* SECTION 1 : LES POINTS (Gamification) */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-blue-100 font-medium uppercase tracking-wider text-xs">Mon Capital Santé</p>
              <p className="text-5xl font-extrabold mt-2">{user.currentPoints}</p>
              <p className="text-blue-200 text-sm mt-1">Points restants</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-white/20 rounded-lg p-3 text-3xl">
                🛡️
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2 : OBJECTIFS DU JOUR (Le Programme) */}
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Objectifs du Jour</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARTE 1 : Calories */}
            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-orange-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                    🔥
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Cible Calories</dt>
                      <dd className="text-2xl font-bold text-gray-900">{program.dailyCalories} kcal</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  Focus : <span className="font-medium text-gray-700">{program.focus}</span>
                </div>
              </div>
            </div>

            {/* CARTE 2 : Pas */}
            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    👟
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Objectif Pas</dt>
                      <dd className="text-2xl font-bold text-gray-900">{program.dailySteps}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  Marche active recommandée
                </div>
              </div>
            </div>

            {/* CARTE 3 : Sport */}
            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    💪
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Renforcement</dt>
                      <dd className="text-2xl font-bold text-gray-900">{program.weeklyResistanceSessions} / sem</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  Engagement choisi
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3 : ACTIONS (Tracking) */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Journal de bord
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p className="mb-4">Validez vos actions pour récupérer vos points quotidiens.</p>
            </div>
            
            {/* INJECTION DU BOUTON INTERACTIF */}
            {/* On passe "true" si dailyLog existe ET workoutDone est true */}
            <WorkoutButton isDoneToday={!!dailyLog?.workoutDone} />
            
          </div>
        </div>

      </main>
    </div>
  );
}