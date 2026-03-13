import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SurveysPanel from "@/components/dashboard/surveys/SurveysPanel";

export default async function EncuestasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true },
  });

  if (!user?.restaurantId) redirect("/dashboard");

  const surveys = await prisma.survey.findMany({
    where: { restaurantId: user.restaurantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      externalUrl: true,
      active: true,
      createdAt: true,
      _count: { select: { surveyQuestions: true, surveyResponses: true } },
    },
  });

  const serialized = surveys.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Encuestas</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {surveys.length} encuesta{surveys.length !== 1 ? "s" : ""} registrada{surveys.length !== 1 ? "s" : ""}
        </p>
      </div>
      <SurveysPanel initialData={serialized} role={user.role} />
    </div>
  );
}
