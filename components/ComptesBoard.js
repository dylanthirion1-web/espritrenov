"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileRole } from "@/app/admin/actions";

const ROLES = [
  ["admin", "Admin"],
  ["directeur", "Directeur"],
];

export default function ComptesBoard({ profiles, currentId }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onRole(id, role) {
    setError("");
    startTransition(async () => {
      const result = await updateProfileRole(id, role);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="admin_list">
      <p className="notice">
        Les comptes se créent dans le dashboard Supabase, menu Authentication, puis Users. L&apos;inscription publique est refusée.
      </p>
      {error ? (
        <p className="form_error" role="alert">
          {error}
        </p>
      ) : null}
      {profiles.map((profile) => (
        <article className="admin_card" key={profile.id}>
          <div className="lead_top">
            <div>
              <h2 className="heading-style-h3">{profile.email}</h2>
              <p className="text-size-small text-color-muted">{profile.id === currentId ? "Compte connecté" : "Compte interne"}</p>
            </div>
            {profile.id === currentId ? (
              <p className="text-weight-bold">Admin</p>
            ) : (
              <label className="form_field">
                <span className="sr-only">Rôle de {profile.email}</span>
                <select className="form_input" value={profile.role} disabled={pending} onChange={(event) => onRole(profile.id, event.target.value)}>
                  {ROLES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
