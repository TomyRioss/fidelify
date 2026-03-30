"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiShoppingBag, FiGift, FiTag, FiClipboard, FiAward } from "react-icons/fi";
import PuntosStore from "./PuntosStore";
import RegalosTab from "./RegalosTab";
import CuponesTab from "./CuponesTab";
import EncuestasTab from "./EncuestasTab";
import SorteosTab from "./SorteosTab";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
  visitCount: number;
  dni: string;
}

interface Props {
  client: Client;
  negocio: string;
}

export default function ClientDashboard({ client, negocio }: Props) {
  const [points, setPoints] = useState(client.points);

  function updatePoints(newPoints: number) {
    setPoints(newPoints);
  }

  return (
    <div className="w-full min-h-screen bg-white px-6 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Hola, {client.firstName} {client.lastName}
          </h1>
          <p className="mt-1 text-neutral-600">DNI: {client.dni} · Visitas: {client.visitCount}</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-6 py-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{points}</p>
          <p className="text-sm text-neutral-700">puntos</p>
        </div>
      </div>

      <Tabs defaultValue="tienda">
        <TabsList className="mb-4 w-full border border-orange-200 bg-orange-50 gap-1 p-1">
          <TabsTrigger value="tienda" className="flex-1 flex-col py-3 gap-1 text-neutral-500 hover:text-orange-600">
            <FiShoppingBag className="text-2xl" /><span>Tienda</span>
          </TabsTrigger>
          <TabsTrigger value="regalos" className="flex-1 flex-col py-3 gap-1 text-neutral-500 hover:text-orange-600">
            <FiGift className="text-2xl" /><span>Regalos</span>
          </TabsTrigger>
          <TabsTrigger value="cupones" className="flex-1 flex-col py-3 gap-1 text-neutral-500 hover:text-orange-600">
            <FiTag className="text-2xl" /><span>Cupones</span>
          </TabsTrigger>
          <TabsTrigger value="encuestas" className="flex-1 flex-col py-3 gap-1 text-neutral-500 hover:text-orange-600">
            <FiClipboard className="text-2xl" /><span>Encuestas</span>
          </TabsTrigger>
          <TabsTrigger value="sorteos" className="flex-1 flex-col py-3 gap-1 text-neutral-500 hover:text-orange-600">
            <FiAward className="text-2xl" /><span>Sorteos</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tienda">
          <PuntosStore client={{ ...client, points }} onPointsChange={updatePoints} />
        </TabsContent>
        <TabsContent value="regalos">
          <RegalosTab clientId={client.id} visitCount={client.visitCount} />
        </TabsContent>
        <TabsContent value="cupones">
          <CuponesTab clientId={client.id} />
        </TabsContent>
        <TabsContent value="encuestas">
          <EncuestasTab clientId={client.id} onPointsChange={updatePoints} currentPoints={points} />
        </TabsContent>
        <TabsContent value="sorteos">
          <SorteosTab clientId={client.id} clientPoints={points} onPointsChange={updatePoints} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
