"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiRequestError, apiRequest } from "@/lib/api";

type TokenResponse = {
  access: string;
  refresh: string;
};

type AuthMode = "login" | "register";

type ApiErrorData = Record<string, unknown>;

function getErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiRequestError) || !error.data) {
    return fallback;
  }

  if (typeof error.data === "string") {
    return error.data || fallback;
  }

  if (typeof error.data !== "object") {
    return fallback;
  }

  const data = error.data as ApiErrorData;
  const firstRelevantError = [
    "detail",
    "username",
    "email",
    "password",
    "password_confirm",
    "non_field_errors",
  ]
    .map((key) => data[key])
    .find((value) => value !== undefined);

  if (typeof firstRelevantError === "string") {
    return firstRelevantError;
  }

  if (Array.isArray(firstRelevantError) && typeof firstRelevantError[0] === "string") {
    return firstRelevantError[0];
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegistering = mode === "register";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (isRegistering && password !== passwordConfirm) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await apiRequest("/api/auth/register/", {
          method: "POST",
          body: JSON.stringify({
            username,
            email,
            password,
            password_confirm: passwordConfirm,
          }),
        });

        setMode("login");
        setPassword("");
        setPasswordConfirm("");
        setNotice("Your ENIGMA account is ready. Sign in to continue.");
        return;
      }

      const tokens = await apiRequest<TokenResponse>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);

      router.push("/dashboard");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          isRegistering
            ? "We could not create your account. Please try again."
            : "Login failed. Check your username and password.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main data-enigma-page className="min-h-screen overflow-hidden bg-[#f8f7f3] px-5 py-5 text-[#20251f] sm:px-8 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden border border-[#dfe2d8] bg-white shadow-[0_24px_80px_rgba(32,47,35,0.09)] lg:grid-cols-[0.9fr_1.1fr] sm:min-h-[calc(100vh-4rem)]">
        <section className="relative flex flex-col overflow-hidden bg-[#304b36] p-7 text-[#f8f7f3] sm:p-10 lg:p-12">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full border border-[#86a07d]/40" />
          <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full border border-[#86a07d]/30" />

          <Link href="/" className="relative flex items-center gap-3 self-start">
            <Image
              src="/enigma-logo.jpeg"
              alt="ENIGMA Coding Club"
              width={112}
              height={112}
              priority
              className="h-11 w-11 rounded-full bg-[#f8f7f3] object-contain p-1"
            />
            <span className="text-sm font-semibold tracking-[0.22em]">ENIGMA</span>
          </Link>

          <div className="relative my-16 max-w-md lg:my-auto">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#c5d2bd]">
              Coding club · NIELIT
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              Decode the unknown. Build what&apos;s next.
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-7 text-[#d7e0d1] sm:text-base">
              Your ENIGMA account is the starting point for your profile,
              skills, and place in the community.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3 border-t border-[#91a78a]/35 pt-6 text-[10px] uppercase tracking-[0.14em] text-[#c5d2bd] sm:text-xs">
            <span>Learn</span>
            <span>Build</span>
            <span>Belong</span>
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#657b60]">
              Member access
            </p>

            <div className="mt-4">
              <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
                {isRegistering ? "Start your journey." : "Welcome back."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6e766b]">
                {isRegistering
                  ? "Create an account to connect with the ENIGMA community."
                  : "Sign in to continue building your ENIGMA presence."}
              </p>
            </div>

            <div
              className="mt-8 grid grid-cols-2 border border-[#dfe2d8] bg-[#f5f6f1] p-1"
              aria-label="Account action"
            >
              <button
                type="button"
                onClick={() => changeMode("login")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  !isRegistering
                    ? "bg-white text-[#304b36] shadow-sm"
                    : "text-[#737b70] hover:text-[#304b36]"
                }`}
                aria-pressed={!isRegistering}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => changeMode("register")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  isRegistering
                    ? "bg-white text-[#304b36] shadow-sm"
                    : "text-[#737b70] hover:text-[#304b36]"
                }`}
                aria-pressed={isRegistering}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose or enter your username"
                  className="w-full border border-[#d8dcd2] bg-[#fbfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a2a99f] focus:border-[#657b60] focus:ring-2 focus:ring-[#657b60]/15"
                />
              </div>

              {isRegistering && (
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-[#d8dcd2] bg-[#fbfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a2a99f] focus:border-[#657b60] focus:ring-2 focus:ring-[#657b60]/15"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isRegistering ? "At least 8 characters" : "Enter your password"}
                  className="w-full border border-[#d8dcd2] bg-[#fbfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a2a99f] focus:border-[#657b60] focus:ring-2 focus:ring-[#657b60]/15"
                />
              </div>

              {isRegistering && (
                <div>
                  <label htmlFor="password-confirm" className="mb-2 block text-sm font-medium">
                    Confirm password
                  </label>
                  <input
                    id="password-confirm"
                    name="password-confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="Repeat your password"
                    className="w-full border border-[#d8dcd2] bg-[#fbfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a2a99f] focus:border-[#657b60] focus:ring-2 focus:ring-[#657b60]/15"
                  />
                </div>
              )}

              {error && (
                <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </p>
              )}

              {notice && (
                <p role="status" className="border border-[#cedfc8] bg-[#eef5eb] px-4 py-3 text-sm leading-6 text-[#345338]">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#304b36] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#243c2c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? isRegistering
                    ? "Creating your account..."
                    : "Signing in..."
                  : isRegistering
                    ? "Create my account"
                    : "Sign in to ENIGMA"}
                <span className="ml-4">↗</span>
              </button>
            </form>

            <p className="mt-7 text-center text-xs leading-5 text-[#858d82]">
              {isRegistering
                ? "Already part of ENIGMA? Choose Sign in above."
                : "New to ENIGMA? Choose Create account to get started."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
