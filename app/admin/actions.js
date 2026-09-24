"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LEAD_STATUSES, REALISATION_CATEGORIES, STATUSES_WITH_DATETIME } from "@/lib/constants";
import { assertAdmin, assertStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

function clean(value) {
  return String(value ?? "").trim();
}

function storagePath(imageUrl) {
  const marker = "/storage/v1/object/public/realisations/";
  const index = String(imageUrl || "").indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(String(imageUrl).slice(index + marker.length).split("?")[0]);
}

function readOrdre(value) {
  const ordre = Number.parseInt(clean(value || "0"), 10);
  if (!Number.isInteger(ordre) || ordre < 0 || ordre > 999) return null;
  return ordre;
}

function fileExtension(file) {
  const match = String(file.name || "")
    .toLowerCase()
    .match(/\.([a-z0-9]{1,10})$/);
  return match ? match[1] : "bin";
}

async function uploadFile(supabase, file) {
  if (!(file instanceof File) || file.size === 0) return { error: "Ajoutez un fichier." };
  if (file.size > MAX_FILE_BYTES) return { error: "Fichier trop lourd : 50 Mo maximum." };

  const path = `${crypto.randomUUID()}.${fileExtension(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("realisations").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    console.error(error);
    return { error: "Le fichier n'a pas pu être envoyé." };
  }

  const { data } = supabase.storage.from("realisations").getPublicUrl(path);
  return { path, imageUrl: data.publicUrl };
}

function missingFeaturedColumn(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`;
  return error?.code === "42703" || message.includes("mise_en_avant");
}

async function insertRealisation(supabase, row) {
  const first = await supabase.from("realisations").insert(row);
  if (!first.error || !missingFeaturedColumn(first.error)) return first;
  if (row.mise_en_avant) return { error: { code: "featured-missing" } };
  const { mise_en_avant, ...rest } = row;
  return supabase.from("realisations").insert(rest);
}

async function updateRealisationRow(supabase, id, row) {
  const first = await supabase.from("realisations").update(row).eq("id", id);
  if (!first.error || !missingFeaturedColumn(first.error)) return first;
  if (row.mise_en_avant) return { error: { code: "featured-missing" } };
  const { mise_en_avant, ...rest } = row;
  return supabase.from("realisations").update(rest).eq("id", id);
}

function refreshRealisations() {
  revalidatePath("/");
  revalidatePath("/admin/realisations");
}

export async function signIn(formData) {
  const email = clean(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Indiquez l'e-mail et le mot de passe." };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré. Renseignez .env.local." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou mot de passe incorrect." };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateLeadStatus(id, statut, dateHeure) {
  if (!UUID.test(String(id)) || !LEAD_STATUSES.includes(statut)) {
    return { error: "Demande introuvable." };
  }

  let dateIso = null;
  if (STATUSES_WITH_DATETIME.includes(statut)) {
    const parsed = new Date(dateHeure);
    if (!dateHeure || Number.isNaN(parsed.getTime())) {
      return { error: "Indiquez une date et une heure." };
    }
    dateIso = parsed.toISOString();
  }

  const { error, session } = await assertStaff();
  if (error) return { error };

  const { error: updateError } = await session.supabase
    .from("leads")
    .update({ statut, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error(updateError);
    return { error: "Le statut n'a pas été modifié." };
  }

  const { error: historyError } = await session.supabase.from("lead_history").insert({
    lead_id: id,
    statut,
    date_heure: dateIso,
    created_by: session.user.id,
  });

  if (historyError) {
    console.error(historyError);
    revalidatePath("/admin");
    return { error: "Le statut est enregistré, mais l'historique n'a pas pu être ajouté." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function createRealisation(formData) {
  const { error, session } = await assertStaff();
  if (error) return { error };

  const titre = clean(formData.get("titre"));
  const description = clean(formData.get("description"));
  const categorie = clean(formData.get("categorie"));
  const ordre = readOrdre(formData.get("ordre"));
  const publie = formData.get("publie") === "on";
  const miseEnAvant = formData.get("mise_en_avant") === "on";

  if (titre.length < 2 || titre.length > 140) return { error: "Indiquez un titre." };
  if (description.length > 2000) return { error: "La description est trop longue." };
  if (!REALISATION_CATEGORIES.includes(categorie)) return { error: "Choisissez une catégorie." };
  if (ordre === null) return { error: "L'ordre doit être un nombre entre 0 et 999." };

  const uploaded = await uploadFile(session.supabase, formData.get("image"));
  if (uploaded.error) return { error: uploaded.error };

  const { error: insertError } = await insertRealisation(session.supabase, {
    titre,
    description,
    categorie,
    image_url: uploaded.imageUrl,
    ordre,
    publie,
    mise_en_avant: miseEnAvant,
  });

  if (insertError) {
    console.error(insertError);
    await session.supabase.storage.from("realisations").remove([uploaded.path]);
    if (insertError.code === "featured-missing") {
      return { error: "Ajoutez d'abord la colonne mise_en_avant dans Supabase." };
    }
    return { error: "La réalisation n'a pas été enregistrée." };
  }

  refreshRealisations();
  return { ok: true };
}

export async function updateRealisation(formData) {
  const { error, session } = await assertStaff();
  if (error) return { error };

  const id = clean(formData.get("id"));
  if (!UUID.test(id)) return { error: "Réalisation introuvable." };

  const titre = clean(formData.get("titre"));
  const description = clean(formData.get("description"));
  const categorie = clean(formData.get("categorie"));
  const ordre = readOrdre(formData.get("ordre"));
  const publie = formData.get("publie") === "on";
  const miseEnAvant = formData.get("mise_en_avant") === "on";

  if (titre.length < 2 || titre.length > 140) return { error: "Indiquez un titre." };
  if (description.length > 2000) return { error: "La description est trop longue." };
  if (!REALISATION_CATEGORIES.includes(categorie)) return { error: "Choisissez une catégorie." };
  if (ordre === null) return { error: "L'ordre doit être un nombre entre 0 et 999." };

  const { data: current, error: readError } = await session.supabase
    .from("realisations")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (readError || !current) return { error: "Réalisation introuvable." };

  let imageUrl = current.image_url;
  let uploadedPath = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadFile(session.supabase, file);
    if (uploaded.error) return { error: uploaded.error };
    imageUrl = uploaded.imageUrl;
    uploadedPath = uploaded.path;
  }

  const { error: updateError } = await updateRealisationRow(session.supabase, id, {
    titre,
    description,
    categorie,
    image_url: imageUrl,
    ordre,
    publie,
    mise_en_avant: miseEnAvant,
    updated_at: new Date().toISOString(),
  });

  if (updateError) {
    console.error(updateError);
    if (uploadedPath) await session.supabase.storage.from("realisations").remove([uploadedPath]);
    if (updateError.code === "featured-missing") {
      return { error: "Ajoutez d'abord la colonne mise_en_avant dans Supabase." };
    }
    return { error: "La modification n'a pas été enregistrée." };
  }

  if (uploadedPath) {
    const previous = storagePath(current.image_url);
    if (previous) await session.supabase.storage.from("realisations").remove([previous]);
  }

  refreshRealisations();
  return { ok: true };
}

export async function deleteRealisation(id) {
  const { error, session } = await assertStaff();
  if (error) return { error };
  if (!UUID.test(String(id))) return { error: "Réalisation introuvable." };

  const { data: current } = await session.supabase
    .from("realisations")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error: deleteError } = await session.supabase.from("realisations").delete().eq("id", id);
  if (deleteError) {
    console.error(deleteError);
    return { error: "La suppression a échoué." };
  }

  const path = storagePath(current?.image_url);
  if (path) await session.supabase.storage.from("realisations").remove([path]);

  refreshRealisations();
  return { ok: true };
}

export async function setRealisationPublished(id, publie) {
  const { error, session } = await assertStaff();
  if (error) return { error };
  if (!UUID.test(String(id)) || typeof publie !== "boolean") return { error: "Réalisation introuvable." };

  const { error: updateError } = await session.supabase
    .from("realisations")
    .update({ publie, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error(updateError);
    return { error: "La publication n'a pas été modifiée." };
  }

  refreshRealisations();
  return { ok: true };
}

export async function updateProfileRole(id, role) {
  const { error, session } = await assertAdmin();
  if (error) return { error };
  if (!UUID.test(String(id)) || !["admin", "directeur"].includes(role)) {
    return { error: "Compte introuvable." };
  }
  if (id === session.user.id) return { error: "Vous ne pouvez pas modifier votre propre rôle." };

  const { error: updateError } = await session.supabase.from("profiles").update({ role }).eq("id", id);
  if (updateError) {
    console.error(updateError);
    return { error: "Le rôle n'a pas été modifié." };
  }

  revalidatePath("/admin/comptes");
  return { ok: true };
}
