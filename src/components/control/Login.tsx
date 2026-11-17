"use client";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
export function Login({ onLogin }: { onLogin: () => void }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/control/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to sign in. Try again.");
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ctl-login" aria-labelledby="control-sign-in">
      <div className="ctl-login-card">
        <Image
          className="ctl-login-logo"
          src="/assets/site/beyonn-control-logo.png"
          alt="Beyonn"
          width={220}
          height={45}
          loading="eager"
        />
        <h1 id="control-sign-in">Admin sign-in</h1>
        <form onSubmit={submit}>
          <label className="ctl-field">
            <span>Admin ID</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
          <label className="ctl-field">
            <span>Password</span>
            <div className="ctl-password">
              <input
                name="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                required
                maxLength={256}
              />
              <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p className="ctl-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="ctl-button ctl-primary ctl-login-submit"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>
        <Link className="ctl-back" href="/">
          Back to website
        </Link>
      </div>
    </main>
  );
}
