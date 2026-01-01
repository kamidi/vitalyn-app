import { auth } from "@/auth";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();
  
  // Sécurité : Si pas connecté -> Login
  if (!session) redirect("/login");

  // TODO V2: Vérifier si déjà onboardé pour rediriger vers dashboard

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Construisons votre programme
          </h1>
          <p className="mt-2 text-gray-600">
            Ces informations nous permettent de calibrer votre métabolisme.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 sm:p-10">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}