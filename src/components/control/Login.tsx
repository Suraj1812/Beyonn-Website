"use client";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import Image from "next/image";
import { Trademark } from "@/components/layout/Trademark";
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
        <Trademark className="ctl-login-logo">
        <Image
          src="/assets/site/beyonn-control-logo.png"
          alt="Beyonn"
          width={190}
          height={39}
          loading="eager"
          style={{ width: "calc(100% - 11px)", height: "auto" }}
        />
        </Trademark>
        <h1 id="control-sign-in">Sign in to your account</h1>
        <p className="ctl-login-caption">Access the Beyonn control panel</p>
        <form onSubmit={submit}>
          <label className="ctl-field ctl-login-input">
            <span className="ctl-sr-only">Admin ID</span>
            <UserRound size={21} aria-hidden="true" />
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Admin ID"
              required
              maxLength={254}
            />
          </label>
          <div className="ctl-field ctl-login-input ctl-password">
            <label className="ctl-sr-only" htmlFor="control-password">Password</label>
            <LockKeyhole size={20} aria-hidden="true" />
            <input
              id="control-password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
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
          <ArrowLeft size={17} aria-hidden="true" />
          Back to website
        </Link>
      </div>
    </main>
  );
}
