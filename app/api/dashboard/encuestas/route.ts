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

export async function GET(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/encuestas GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const surveys = await prisma.survey.findMany({
      where: { restaurantId: me.restaurantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        externalUrl: true,
        active: true,
        createdAt: true,
        surveyQuestions: true,
        surveyActions: true,
        _count: { select: { surveyQuestions: true, surveyResponses: true } },
      },
    });

    let result = surveys;

    if (clientId) {
      const responses = await prisma.surveyResponse.findMany({
        where: { clientId, surveyId: { in: surveys.map((s) => s.id) } },
        select: { surveyId: true },
      });
      const respondedIds = new Set(responses.map((r) => r.surveyId));
      result = surveys.map((s) => ({ ...s, alreadyResponded: respondedIds.has(s.id) }));
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/dashboard/encuestas GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/encuestas POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para crear encuestas." }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, externalUrl, questions } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Título y tipo son requeridos." }, { status: 400 });
    }

    if (!["INTERNAL", "EXTERNAL"].includes(type)) {
      return NextResponse.json({ error: "Tipo de encuesta inválido." }, { status: 400 });
    }

    if (type === "EXTERNAL" && !externalUrl) {
      return NextResponse.json({ error: "La URL externa es requerida para encuestas externas." }, { status: 400 });
    }

    const survey = await prisma.$transaction(async (tx) => {
      const created = await tx.survey.create({
        data: {
          restaurantId: me.restaurantId!,
          title,
          description: description || null,
          type,
          externalUrl: type === "EXTERNAL" ? externalUrl : null,
        },
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

      if (type === "INTERNAL" && Array.isArray(questions) && questions.length > 0) {
        const questionsData = questions.map((q: { text: string; type: string; options?: string }, idx: number) => ({
          surveyId: created.id,
          text: q.text,
          type: q.type as any,
          options: q.options ? JSON.parse(JSON.stringify(q.options.split(",").map((o: string) => o.trim()))) : null,
          order: idx + 1,
        }));
        await tx.surveyQuestion.createMany({ data: questionsData });
      }

      return created;
    });

    return NextResponse.json(survey, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/encuestas POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
