"use client";

import { useEffect, useState, useTransition } from "react";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { updateLeadStatus } from "@/app/admin/actions";

const FILTERS = ["tous", ...LEAD_STATUSES];

function formatDate(value) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusClass(statut) {
  if (statut === "en cours") return "status_encours";
  if (statut === "traité") return "status_traite";
  return "status_nouveau";
}

export default function LeadsBoard({ leads }) {
  const [items, setItems] = useState(leads);
  const [filter, setFilter] = useState("tous");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(leads);
  }, [leads]);

  const visible = filter === "tous" ? items : items.filter((lead) => lead.statut === filter);

  function onStatus(id, statut) {
    setError("");
    setItems((current) => current.map((lead) => (lead.id === id ? { ...lead, statut } : lead)));
    startTransition(async () => {
      const result = await updateLeadStatus(id, statut);
      if (result?.error) setError(result.error);
    });
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
          {visible.map((lead) => (
            <article className="admin_card" key={lead.id}>
              <div className="lead_top">
                <div>
                  <h2 className="heading-style-h3">{lead.nom}</h2>
                  <p className="text-size-small text-color-muted">{formatDate(lead.created_at)}</p>
                </div>
                <label className="form_field">
                  <span className="sr-only">Statut de {lead.nom}</span>
                  <select
                    className={`form_input ${statusClass(lead.statut)}`}
                    value={lead.statut}
                    disabled={pending}
                    onChange={(event) => onStatus(lead.id, event.target.value)}
                  >
                    {LEAD_STATUSES.map((statut) => (
                      <option key={statut} value={statut}>
                        {STATUS_LABELS[statut]}
                      </option>
                    ))}
                  </select>
                </label>
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
