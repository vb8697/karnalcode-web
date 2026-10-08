"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, TextField } from "@/components/ui";
import { routeAfterSignIn } from "@/lib/profile";
import { getSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Partial<Record<"name" | "email" | "password", string>>;

/** Sign in or create an account. After sign-in it sends people to finish their profile if needed. */
export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (mode === "signup" && name.trim().length < 2) found.name = "Enter your name";
    if (!EMAIL_RE.test(email.trim())) found.email = "Enter a valid email address";
    if (password.length < 6) found.password = "Use at least 6 characters";
    setErrors(found);
    setFormError(null);
    setNotice(null);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const supabase = getSupabase();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
          setBusy(false);
          return;
        }
        router.push("/complete-profile");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      router.push(await routeAfterSignIn(data.user.id));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not start Google sign-in.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Button type="button" variant="secondary" onClick={handleGoogle} disabled={busy}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" />
          <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.6 14.7a7.200 7.200 0 0 1 0-4.600v-3H1.800a12 12 0 0 0 0 10.700l3.800-3.100z" />
          <path fill="#EA4335" d="M12 4.800c1.700 0 3.200.6 4.400 1.700l3.300-3.300A12 12 0 0 0 1.800 6.700l3.800 3c.9-2.800 3.400-4.900 6.400-4.900z" />
        </svg>
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>
      {mode === "signup" ? (
        <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
      ) : null}
      <TextField
        label="College email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@college.edu"
        autoComplete="email"
      />
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="At least 6 characters"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        trailing={
          <button type="button" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword} className="rounded-lg px-2 py-1 text-xs font-bold text-muted hover:text-primary">
            {showPassword ? "Hide" : "Show"}
          </button>
        }
      />

      {notice ? (
        <p role="status" className="rounded-xl bg-teal-tint px-4 py-3 text-sm font-medium text-teal-text">
          {notice}
        </p>
      ) : null}
      {formError ? (
        <p role="alert" className="text-sm text-error">
          {formError}
        </p>
      ) : null}

      <Button type="submit" loading={busy}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setErrors({});
          setFormError(null);
        }}
        className="text-sm font-bold text-primary"
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
