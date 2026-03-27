"use client";

import { useRouter } from "next/navigation";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
};

type CallerRole = "OWNER" | "ADMIN" | "EMPLOYEE";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EMPLOYEE: "Empleado",
};

export default function EmployeesTable({
  initialData,
  callerRole,
}: {
  initialData: Employee[];
  callerRole: CallerRole;
}) {
  const router = useRouter();

  const canCreate = callerRole === "OWNER" || callerRole === "ADMIN";
  const canEdit = (target: Employee) => {
    if (callerRole === "OWNER") return target.role === "ADMIN" || target.role === "EMPLOYEE";
    if (callerRole === "ADMIN") return target.role === "EMPLOYEE";
    return false;
  };
  const canDelete = (target: Employee) => {
    if (callerRole === "OWNER") return true;
    if (callerRole === "ADMIN") return target.role === "EMPLOYEE";
    return false;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-6">
        <p className="text-sm text-neutral-500">
          {initialData.length} miembro{initialData.length !== 1 ? "s" : ""} del equipo
        </p>
        {canCreate && (
          <Button
            onClick={() => router.push("/dashboard/empleados/new")}
            size="sm"
            className="flex items-center gap-2"
          >
            <FiPlus className="text-base" />
            Nuevo empleado
          </Button>
        )}
      </div>

      <div className="border-t border-orange-200 bg-white overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-orange-50 text-left">
                <th className="px-6 py-4 font-medium text-neutral-600">Nombre</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Email</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Rol</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Estado</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Alta</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((emp) => (
                <tr key={emp.id} className="border-b border-neutral-100 last:border-0 hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{emp.name}</td>
                  <td className="px-6 py-4 text-neutral-500">{emp.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      {ROLE_LABELS[emp.role] ?? emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${emp.active ? "bg-orange-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
                      {emp.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(emp.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {canEdit(emp) && (
                        <button
                          onClick={() => router.push(`/dashboard/empleados/${emp.id}/edit`)}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                      )}
                      {canDelete(emp) ? (
                        <button
                          onClick={() => router.push(`/dashboard/empleados/${emp.id}/delete`)}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      ) : (
                        !canEdit(emp) && <span className="text-neutral-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                    No hay empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
