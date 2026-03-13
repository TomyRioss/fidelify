import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, restaurantId: true },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/encuestas/[id]/respond POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { clientId, answers } = body;

    if (!clientId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "clientId y answers son requeridos." }, { status: 400 });
    }

    const branch = await prisma.branch.findFirst({
      where: { restaurantId: me.restaurantId, active: true },
      select: { id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "Sin sucursales configuradas." }, { status: 400 });
    }

    const survey = await prisma.survey.findFirst({
      where: { id, restaurantId: me.restaurantId, active: true },
      include: { surveyActions: true },
    });
    if (!survey) {
      return NextResponse.json({ error: "Encuesta no encontrada." }, { status: 404 });
    }

    const existing = await prisma.surveyResponse.findFirst({
      where: { surveyId: id, clientId },
    });
    if (existing) {
      return NextResponse.json({ error: "El cliente ya respondió esta encuesta." }, { status: 400 });
    }

    let pointsAwarded = 0;

    await prisma.$transaction(async (tx) => {
      const response = await tx.surveyResponse.create({
        data: {
          restaurantId: me.restaurantId!,
          branchId: branch.id,
          clientId,
          surveyId: id,
          actionsExecuted: true,
        },
      });

      if (answers.length > 0) {
        await tx.surveyAnswer.createMany({
          data: answers.map((a: { questionId: string; answer: string }) => ({
            responseId: response.id,
            questionId: a.questionId,
            answer: String(a.answer),
          })),
        });
      }

      for (const action of survey.surveyActions) {
        if (action.actionType === "ADD_POINTS") {
          const payload = action.payload as { points?: number };
          const pts = payload.points ?? 0;
          if (pts > 0) {
            pointsAwarded += pts;
            await tx.pointsLedger.create({
              data: {
                restaurantId: me.restaurantId!,
                branchId: branch.id,
                clientId,
                delta: pts,
                type: "SURVEY_REWARD",
                referenceId: response.id,
              },
            });
            await tx.client.update({
              where: { id: clientId },
              data: { points: { increment: pts } },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true, pointsAwarded });
  } catch (err) {
    console.error("[api/dashboard/encuestas/[id]/respond POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
