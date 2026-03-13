import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ClientDetail from "@/components/dashboard/ClientDetail";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true },
  });

  if (!user?.restaurantId) redirect("/dashboard");

  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, restaurantId: user.restaurantId },
    select: {
      id: true,
      dni: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      points: true,
      visitCount: true,
      active: true,
      createdAt: true,
    },
  });

  if (!client) notFound();

  return (
    <ClientDetail
      client={{
        ...client,
        createdAt: client.createdAt.toISOString(),
      }}
    />
  );
}
