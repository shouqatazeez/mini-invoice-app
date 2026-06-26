"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReceiptText, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-zinc-950">
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[45%] lg:px-14 xl:px-24">
        <div className="w-full max-w-[380px]">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ReceiptText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-wide text-zinc-300">
              InvoTrack
            </span>
          </div>

          <div className="mb-10 space-y-2.5">
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-100">
              Welcome back
            </h1>
            <p className="text-[15px] leading-relaxed text-zinc-400">
              Sign in to your billing workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="h-12 w-full mt-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-[15px] text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-primary focus:bg-zinc-900/80 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 pr-12 pl-4 text-[15px] text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-primary focus:bg-zinc-900/80 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition-colors hover:text-zinc-300"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex mt-2 h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden w-[55%] items-center justify-center border-l border-zinc-700/40 bg-zinc-900/50 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />
        <div className="relative z-10 max-w-[420px] space-y-5 text-center">
          <p className="text-[1.4rem] font-semibold leading-relaxed tracking-tight text-zinc-200">
            Stay on top of your billing effortlessly.
          </p>
          <p className="text-[15px] leading-relaxed text-zinc-400">
            Create invoices, track payments, and manage customers through a
            clean billing dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}
