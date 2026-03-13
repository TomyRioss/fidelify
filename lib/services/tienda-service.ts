import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function getRestaurantBySlug(slug: string) {
  return await prisma.restaurant.findFirst({
    where: { slug },
    select: { id: true, name: true },
  });
}

export async function getClientByDniAndPin(restaurantId: string, dni: string, pin: string) {
  const client = await prisma.client.findUnique({
    where: { restaurantId_dni: { restaurantId, dni } },
  });

  if (!client || !client.pin) return null;

  const isValid = await bcrypt.compare(pin, client.pin);
  return isValid ? client : null;
}

export async function hashPin(pin: string): Promise<string> {
  return await bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pin, hash);
}

export async function getClientByIdAndRestaurant(restaurantId: string, clientId: string) {
  return await prisma.client.findFirst({
    where: { id: clientId, restaurantId },
  });
}
