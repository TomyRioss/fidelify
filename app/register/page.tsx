"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn, FiUser, FiHome, FiEye, FiEyeOff } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, restaurantName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear cuenta.");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Cuenta creada. Por favor iniciá sesión manualmente.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("[Register] error:", err);
      setError("Error inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full" style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
      <div className="hidden md:flex w-[60%] relative" style={{ margin: 0, padding: 0 }}>
        <img
          src="https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Waterfall"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-orange-900/30" />
      </div>

      <div className="w-full md:w-[40%] flex items-start justify-center bg-white" style={{ margin: 0, padding: 0 }}>
        <div className="w-full px-8 pt-2 pb-12">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img src="/logotipo.png" alt="Fidelgo" className="h-64 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
              Crear cuenta
            </h1>
            <p className="text-sm text-neutral-500">
              Comenzá a fidelizar a tus clientes hoy
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="restaurantName" className="text-orange-700 text-sm font-medium">
                Nombre del negocio
              </Label>
              <div className="relative">
                <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="restaurantName"
                  type="text"
                  placeholder="Mi Restaurante"
                  className="pl-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-orange-700 text-sm font-medium">
                Nombre completo
              </Label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  className="pl-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
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
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-orange-700 text-sm font-medium">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 bg-white border-orange-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-orange-300"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-orange-600 text-white hover:bg-orange-500 transition-colors h-11"
            >
              <FiLogIn />
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-sm font-medium text-orange-600 hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
