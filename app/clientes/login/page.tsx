"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClienteLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as { type?: string })?.type === "cliente") {
      router.replace("/clientes");
    }
  }, [status, session, router]);

  if (status === "loading") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("cliente", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      console.error("[ClienteLogin] error:", result.error);
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/clientes");
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

      <div className="w-full md:w-[40%] flex items-start justify-center bg-white">
        <div className="w-full px-8 pt-2 pb-12">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img
                src="/logotipo.png"
                alt="Fidelgo"
                className="h-64 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
              Acceder como cliente
            </h1>
            <p className="text-sm text-neutral-500">
              Ingresá a tu cuenta de Fielgo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="current-password"
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

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-orange-600 text-white hover:bg-orange-500 h-11"
            >
              <FiLogIn />
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              ¿No tenés cuenta?{" "}
              <Link href="/clientes/registro" className="text-sm font-medium text-orange-600 hover:underline">
                Registrate gratis
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-400">
              ¿Sos un negocio?{" "}
              <Link href="/login" className="text-sm text-orange-600 hover:underline">
                Ingresá acá
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
