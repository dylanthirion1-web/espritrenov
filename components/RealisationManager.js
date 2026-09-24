"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { REALISATION_CATEGORIES } from "@/lib/constants";
import { createRealisation, deleteRealisation, setRealisationPublished, updateRealisation } from "@/app/admin/actions";
import BeforeAfter from "@/components/BeforeAfter";

function Fields({ item, prefix }) {
  const fieldId = (name) => `${prefix}-${name}`;
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="form_grid">
        <div className="form_field">
          <label className="form_label" htmlFor={fieldId("titre")}>
            Titre
          </label>
          <input className="form_input" id={fieldId("titre")} name="titre" required defaultValue={item?.titre || ""} />
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor={fieldId("categorie")}>
            Catégorie
          </label>
          <select className="form_input" id={fieldId("categorie")} name="categorie" defaultValue={item?.categorie || "Couverture"}>
            {REALISATION_CATEGORIES.map((categorie) => (
              <option key={categorie}>{categorie}</option>
            ))}
          </select>
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor={fieldId("ordre")}>
            Ordre
          </label>
          <input className="form_input" id={fieldId("ordre")} name="ordre" type="number" min="0" max="999" defaultValue={item?.ordre ?? 0} />
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor={fieldId("avant")}>
            Avant travaux
          </label>
          <input className="form_input" id={fieldId("avant")} name="avant" type="file" />
          <span className="text-size-small text-color-muted">
            {item ? "Facultatif. Vide = fichier conservé. 50 Mo maximum." : "Facultatif. Image, vidéo ou autre fichier. 50 Mo maximum."}
          </span>
        </div>
        <div className="form_field">
          <label className="form_label" htmlFor={fieldId("apres")}>
            Après travaux
          </label>
          <input className="form_input" id={fieldId("apres")} name="apres" type="file" />
          <span className="text-size-small text-color-muted">
            {item ? "Facultatif. Vide = fichier conservé. 50 Mo maximum." : "Facultatif. Image, vidéo ou autre fichier. 50 Mo maximum."}
          </span>
        </div>
        <div className="form_field is-full">
          <label className="form_label" htmlFor={fieldId("description")}>
            Description
          </label>
          <textarea className="form_input" id={fieldId("description")} name="description" defaultValue={item?.description || ""} />
        </div>
      </div>
      <label className="check_line" htmlFor={fieldId("publie")}>
        <input id={fieldId("publie")} type="checkbox" name="publie" defaultChecked={Boolean(item?.publie)} />
        Publié sur le site
      </label>
      <label className="check_line" htmlFor={fieldId("mise_en_avant")}>
        <input id={fieldId("mise_en_avant")} type="checkbox" name="mise_en_avant" defaultChecked={Boolean(item?.mise_en_avant)} />
        Mettre en avant
      </label>
    </>
  );
}

export default function RealisationManager({ realisations }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [pending, startTransition] = useTransition();

  function run(action, data, form) {
    setError("");
    startTransition(async () => {
      const result = await action(data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(null);
      form?.reset();
      router.refresh();
    });
  }

  return (
    <div className="admin_list">
      {error ? (
        <p className="form_error" role="alert">
          {error}
        </p>
      ) : null}
      <form
        className="admin_card"
        onSubmit={(event) => {
          event.preventDefault();
          run(createRealisation, new FormData(event.currentTarget), event.currentTarget);
        }}
      >
        <h2 className="heading-style-h3">Ajouter une réalisation</h2>
        <Fields prefix="new" />
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Ajouter"}
        </button>
      </form>

      {realisations.length === 0 ? <p className="empty_state">Aucune réalisation pour le moment.</p> : null}

      {realisations.map((item) => (
        <article className="admin_card" key={item.id}>
          <BeforeAfter avant={item.avant_url} apres={item.apres_url} alt={item.titre} />
          <div className="lead_top">
            <div>
              <p className="project_tag">{item.categorie}</p>
              <h2 className="heading-style-h3">{item.titre}</h2>
              <p className="text-size-small text-color-muted">
                {item.publie ? "Publié" : "Masqué"}
                {item.mise_en_avant ? " · Mis en avant" : ""} · ordre {item.ordre}
              </p>
            </div>
            <div className="admin_actions">
              <button
                className="button is-compact"
                type="button"
                disabled={pending}
                onClick={() => run(() => setRealisationPublished(item.id, !item.publie))}
              >
                {item.publie ? "Dépublier" : "Publier"}
              </button>
              <button className="button is-secondary" type="button" onClick={() => setEditing(editing === item.id ? null : item.id)}>
                Modifier
              </button>
              <button
                className="button is-secondary"
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`Supprimer « ${item.titre} » ?`)) return;
                  run(() => deleteRealisation(item.id));
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
          {editing === item.id ? (
            <form
              className="form"
              onSubmit={(event) => {
                event.preventDefault();
                run(updateRealisation, new FormData(event.currentTarget));
              }}
            >
              <Fields item={item} prefix={item.id} />
              <button className="button" type="submit" disabled={pending}>
                Enregistrer
              </button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
