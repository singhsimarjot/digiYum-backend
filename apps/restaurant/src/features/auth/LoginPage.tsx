import { FormEvent, useState } from "react";
import { Lock, Mail, Loader2 } from "lucide-react";

import { saveAuth, type LoginResponse } from "../../auth/auth";
import { C } from "../shared/theme";

const API_URL = "http://127.0.0.1:8000";

type LoginPageProps = {
  onLogin: () => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);
 console.log("Submitting login form with email:", email, "and password:", password);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password",
        );
      }

      saveAuth(data as LoginResponse);

      onLogin();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: C.bg,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{
              background:
                "linear-gradient(135deg, #E63946, #c0293a)",
            }}
          >
            <span className="text-2xl">🍽</span>
          </div>

          <h1
            className="text-2xl font-bold"
            style={{ color: C.text }}
          >
            Saveur
          </h1>

          <p
            className="text-sm mt-1"
            style={{ color: C.muted }}
          >
            Restaurant Owner Portal
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border shadow-sm p-6"
          style={{
            borderColor: C.border,
          }}
        >
          <div className="mb-6">
            <h2
              className="text-lg font-bold"
              style={{ color: C.text }}
            >
              Welcome back
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: C.muted }}
            >
              Sign in to manage your restaurant.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: "#FEE2E2",
                color: C.red,
              }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: C.text }}
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.muted }}
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="owner@restaurant.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{
                  borderColor: C.border,
                  color: C.text,
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: C.text }}
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.muted }}
              />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{
                  borderColor: C.border,
                  color: C.text,
                }}
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
            style={{
              background: C.red,
            }}
          >
            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: C.muted }}
        >
          DigiYum Restaurant Management
        </p>
      </div>
    </div>
  );
}

export default LoginPage;