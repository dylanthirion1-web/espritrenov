"use server";

import { revalidatePath } from "next/cache";
import { WORK_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

function clean(value) {
  return String(value ?? "").trim();
}

export async function submitLead(input) {
  if (clean(input?.company)) return { ok: true };

  const nom = clean(input?.nom);
  const telephone = clean(input?.telephone);
  const email = clean(input?.email).toLowerCase();
  const typeTravaux = clean(input?.typeTravaux);
  const adresse = clean(input?.adresse);
  const ville = clean(input?.ville);
  const codePostal = clean(input?.codePostal);
  const projet = clean(input?.projet);

  if (nom.length < 2 || nom.length > 120) return { error: "Indiquez votre nom." };
  if (telephone.replace(/\D/g, "").length < 8 || telephone.length > 30) {
    return { error: "Indiquez un téléphone joignable." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { error: "Indiquez un e-mail valide." };
  }
  if (!WORK_TYPES.includes(typeTravaux)) return { error: "Choisissez un type de travaux." };
  if (adresse.length < 2 || adresse.length > 200) return { error: "Indiquez l'adresse du chantier." };
  if (ville.length < 2 || ville.length > 80) return { error: "Indiquez la ville du chantier." };
  if (!/^[0-9]{5}$/.test(codePostal)) return { error: "Indiquez un code postal à 5 chiffres." };
  if (projet.length < 12 || projet.length > 4000) {
    return { error: "Décrivez le projet en quelques phrases." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "L'envoi n'est pas encore branché. Appelez le 07 80 64 15 11." };
  }

  const { error } = await supabase.from("leads").insert({
    nom,
    telephone,
    email,
    type_travaux: typeTravaux,
    adresse,
    ville,
    code_postal: codePostal,
    projet,
    statut: "nouveau",
  });

  if (error) {
    console.error(error);
    return { error: "La demande n'a pas pu être enregistrée. Appelez le 07 80 64 15 11." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
