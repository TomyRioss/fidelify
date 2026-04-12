"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCreditCard } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function ClienteRegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/cliente/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al registrarse.");
        setLoading(false);
        return;
      }

      const result = await signIn("cliente", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Registro exitoso, pero error al ingresar. Iniciá sesión manualmente.");
        router.push("/clientes/login");
        return;
      }

      router.push("/clientes");
    } catch (err) {
      console.error("[ClienteRegistro]", err);
      toast.error("Error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      <div className="hidden md:flex w-[60%] relative">
        <img
          src="https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Fidelgo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-orange-900/30" />
      </div>

      <div className="w-full md:w-[40%] flex items-start justify-center bg-white overflow-y-auto">
        <div className="w-full px-8 pt-2 pb-12">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img
                src="/logotipo.png"
                alt="Fidelgo"
                className="h-48 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
              Crear cuenta
            </h1>
            <p className="text-sm text-neutral-500">
              Registrate para acceder a tus locales adheridos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-orange-700 text-sm font-medium">
                  Nombre
                </Label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Juan"
                    className="pl-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-orange-700 text-sm font-medium">
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Pérez"
                  className="bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dni" className="text-orange-700 text-sm font-medium">
                DNI
              </Label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="dni"
                  name="dni"
                  placeholder="46800296"
                  className="pl-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={form.dni}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-orange-700 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-orange-700 text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white hover:bg-orange-500 h-11"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              ¿Ya tenés cuenta?{" "}
              <Link href="/clientes/login" className="text-sm font-medium text-orange-600 hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
