"use client";

import { useState } from "react";
import { signIn } from "@/app/admin/actions";

export default function LoginForm({ configured, denied }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await signIn(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="login_screen">
      <div className="login_card">
        <p className="eyebrow">Espace interne</p>
        <h1 className="heading-style-h2">Connexion</h1>
        {denied ? <p className="notice">Ce compte n&apos;a pas accès à l&apos;espace interne.</p> : null}
        {configured ? (
          <form className="form" onSubmit={onSubmit}>
            <div className="form_field">
              <label className="form_label" htmlFor="email">
                E-mail
              </label>
              <input className="form_input" id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="form_field">
              <label className="form_label" htmlFor="password">
                Mot de passe
              </label>
              <input className="form_input" id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            {error ? (
              <p className="form_error" role="alert">
                {error}
              </p>
            ) : null}
            <button className="button is-full" type="submit" disabled={pending}>
              {pending ? "Connexion…" : "Entrer"}
            </button>
          </form>
        ) : (
          <p className="notice">Renseignez les clés Supabase dans .env.local pour ouvrir l&apos;espace admin.</p>
        )}
      </div>
    </div>
  );
}
