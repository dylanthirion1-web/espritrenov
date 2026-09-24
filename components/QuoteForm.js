"use client";

import { useState } from "react";
import { WORK_TYPES } from "@/lib/constants";
import { submitLead } from "@/app/actions";

const EMPTY = { nom: "", telephone: "", email: "", typeTravaux: "", projet: "", company: "" };

export default function QuoteForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    const result = await submitLead(values);
    setPending(false);
    if (result?.error) {
      setErrors({ form: result.error });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="form_success" role="status">
        <h3 className="heading-style-h3">Demande envoyée</h3>
        <p>Merci {values.nom}. Nous revenons vers vous sous 48 h, sans engagement.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <p className="text-size-small text-color-muted">Réponse sous 48 h, sans engagement.</p>
      <div className="form_honeypot" aria-hidden="true">
        <label htmlFor="company">Société</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={update} />
      </div>
      <div className="form_grid">
        <div className="form_field">
          <label className="form_label" htmlFor="nom">
            Nom
          </label>
          <input className="form_input" id="nom" name="nom" autoComplete="name" required value={values.nom} onChange={update} />
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor="telephone">
            Téléphone
          </label>
          <input
            className="form_input"
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={values.telephone}
            onChange={update}
          />
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor="email">
            E-mail
          </label>
          <input className="form_input" id="email" name="email" type="email" autoComplete="email" required value={values.email} onChange={update} />
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor="typeTravaux">
            Type de travaux
          </label>
          <select className="form_input" id="typeTravaux" name="typeTravaux" required value={values.typeTravaux} onChange={update}>
            <option value="">Choisir</option>
            {WORK_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form_field is-full">
          <label className="form_label" htmlFor="projet">
            Projet
          </label>
          <textarea
            className="form_input"
            id="projet"
            name="projet"
            required
            placeholder="Décrivez le bâtiment et les travaux à prévoir."
            value={values.projet}
            onChange={update}
          />
        </div>
      </div>
      {errors.form ? (
        <p className="form_error" role="alert">
          {errors.form}
        </p>
      ) : null}
      <button className="button is-full" type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Demander un devis gratuit"}
      </button>
    </form>
  );
}
