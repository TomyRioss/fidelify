"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      console.error("[AdminLogin] signIn error:", result.error);
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/auth", { method: "POST" });
    if (!res.ok) {
      console.error("[AdminLogin] rol verification failed, status:", res.status);
      setError("No tenés permisos para acceder al panel de administración.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0] px-4">
      <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Admin
        </h1>
        <p className="text-sm text-neutral-500">
          Acceso restringido a administradores del sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-neutral-700 text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <Input
              id="email"
              type="email"
              placeholder="admin@email.com"
              className="pl-9 bg-stone-50 border-stone-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-neutral-700 text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9 bg-stone-50 border-stone-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
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
          className="w-full gap-2 bg-neutral-900 text-stone-50 hover:bg-neutral-700 transition-colors"
        >
          <FiLogIn />
          {loading ? "Verificando..." : "Ingresar"}
        </Button>
      </form>
    </div>
      </div>
    </div>
  );
}
