"use client";

import { useEffect, useState, useTransition } from "react";
import { LEAD_STATUSES, STATUS_LABELS, STATUSES_WITH_DATETIME } from "@/lib/constants";
import { updateLeadStatus } from "@/app/admin/actions";

const FILTERS = ["tous", ...LEAD_STATUSES];

function formatDate(value) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function LeadsBoard({ leads }) {
  const [items, setItems] = useState(leads);
  const [filter, setFilter] = useState("tous");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(leads);
  }, [leads]);

  const visible = filter === "tous" ? items : items.filter((lead) => lead.statut === filter);

  function save(id, statut, dateHeure) {
    setError("");
    startTransition(async () => {
      const result = await updateLeadStatus(id, statut, dateHeure);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setDraft(null);
      setItems((current) =>
        current.map((lead) => {
          if (lead.id !== id) return lead;
          return {
            ...lead,
            statut,
            history: [
              {
                id: crypto.randomUUID(),
                statut,
                date_heure: dateHeure ? new Date(dateHeure).toISOString() : null,
                created_at: new Date().toISOString(),
              },
              ...(lead.history || []),
            ],
          };
        }),
      );
    });
  }

  function onStatus(id, statut) {
    setError("");
    if (STATUSES_WITH_DATETIME.includes(statut)) {
      setDraft({ id, statut, dateHeure: "" });
      return;
    }
    setDraft((current) => (current?.id === id ? null : current));
    save(id, statut, null);
  }

  function confirmDraft() {
    if (!draft?.dateHeure) {
      setError("Indiquez une date et une heure.");
      return;
    }
    save(draft.id, draft.statut, draft.dateHeure);
  }

  return (
    <div>
      <div className="filters margin-bottom margin-medium" role="tablist" aria-label="Filtrer par statut">
        {FILTERS.map((item) => (
          <button key={item} type="button" className={filter === item ? "is-active" : undefined} onClick={() => setFilter(item)}>
            {item === "tous" ? "Tous" : STATUS_LABELS[item]}
          </button>
        ))}
      </div>
      {error ? (
        <p className="form_error margin-bottom margin-small" role="alert">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="empty_state">Aucune demande dans ce filtre.</p>
      ) : (
        <div className="admin_list">
          {visible.map((lead) => {
            const selected = draft?.id === lead.id ? draft.statut : lead.statut;
            const waitingForDate = draft?.id === lead.id;
            return (
              <article className="admin_card" key={lead.id}>
                <div className="lead_top">
                  <div>
                    <h2 className="heading-style-h3">{lead.nom}</h2>
                    <p className="text-size-small text-color-muted">{formatDate(lead.created_at)}</p>
                  </div>
                  <div className="lead_status">
                    <label className="form_field">
                      <span className="sr-only">Statut de {lead.nom}</span>
                      <select
                        className="form_input"
                        value={selected}
                        disabled={pending}
                        onChange={(event) => onStatus(lead.id, event.target.value)}
                      >
                        {(LEAD_STATUSES.includes(selected) ? LEAD_STATUSES : [selected, ...LEAD_STATUSES]).map((statut) => (
                          <option key={statut} value={statut}>
                            {STATUS_LABELS[statut] || statut}
                          </option>
                        ))}
                      </select>
                    </label>
                    {waitingForDate ? (
                      <div className="lead_datetime">
                        <label className="form_field">
                          <span className="sr-only">Date et heure pour {STATUS_LABELS[draft.statut]}</span>
                          <input
                            className="form_input"
                            type="datetime-local"
                            value={draft.dateHeure}
                            disabled={pending}
                            onChange={(event) => setDraft({ ...draft, dateHeure: event.target.value })}
                          />
                        </label>
                        <button type="button" className="button is-compact" disabled={pending} onClick={confirmDraft}>
                          Valider
                        </button>
                        <button type="button" className="button is-secondary is-compact" disabled={pending} onClick={() => setDraft(null)}>
                          Annuler
                        </button>
                      </div>
                    ) : STATUSES_WITH_DATETIME.includes(lead.statut) ? (
                      <button
                        type="button"
                        className="button is-secondary is-compact"
                        disabled={pending}
                        onClick={() => setDraft({ id: lead.id, statut: lead.statut, dateHeure: "" })}
                      >
                        Nouvelle date
                      </button>
                    ) : null}
                  </div>
                </div>
                <p>
                  <a href={`tel:${lead.telephone.replace(/\s/g, "")}`}>{lead.telephone}</a>
                  {" · "}
                  <a href={`mailto:${lead.email}`}>{lead.email}</a>
                </p>
                <p className="project_tag">{lead.type_travaux}</p>
                <p>
                  {[lead.adresse, [lead.code_postal, lead.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                </p>
                <p>{lead.projet}</p>
                {(lead.history || []).length > 0 ? (
                  <ol className="lead_history">
                    {lead.history.map((entry) => (
                      <li key={entry.id}>
                        <span>{STATUS_LABELS[entry.statut] || entry.statut}</span>
                        <span className="text-size-small text-color-muted">
                          {entry.date_heure ? formatDate(entry.date_heure) : formatDate(entry.created_at)}
                          {entry.date_heure ? ` · noté le ${formatDate(entry.created_at)}` : ""}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
