"use client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
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
    <div className="ctl-login">
      <section className="ctl-login-story">
        <Link href="/" className="ctl-brand">
          <span className="ctl-brand-mark">b.</span>
          <span>
            beyonn<span className="ctl-brand-sub">WEBSITE CONTROL</span>
          </span>
        </Link>
        <div>
          <span className="ctl-eyebrow">YOUR WEBSITE. YOUR CONTROL.</span>
          <h1>
            A thoughtful space
            <br />
            to make things
            <br />
            <em>happen.</em>
          </h1>
          <p>
            One place for your content, your brand, and everything that comes
            next.
          </p>
          <div className="ctl-login-trust">
            <ShieldCheck size={19} />
            Private access. Purposeful control.
          </div>
        </div>
        <small>Beyond training. Beyond expectations.</small>
        <div className="ctl-orbit ctl-orbit-one" />
        <div className="ctl-orbit ctl-orbit-two" />
      </section>
      <section className="ctl-login-form">
        <div className="ctl-login-card">
          <div className="ctl-login-icon">
            <LockKeyhole size={25} />
          </div>
          <span className="ctl-eyebrow">BEYONN CONTROL</span>
          <h2>Welcome back.</h2>
          <p>Sign in to manage your website.</p>
          <form onSubmit={submit}>
            <label className="ctl-field">
              <span>Admin ID</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@beyonn.co"
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
                  placeholder="Enter your password"
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
              {busy ? "Signing in…" : "Sign in to Control"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="ctl-login-note">
            <ShieldCheck size={15} />
            Authorized administrators only.
            <br />
            Your session closes after 15 minutes of inactivity.
          </p>
          <Link className="ctl-back" href="/">
            ← Back to the website
          </Link>
        </div>
      </section>
    </div>
  );
}
