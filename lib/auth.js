import { createClient } from "@/lib/supabase/server";

const STAFF = ["admin", "directeur"];

export async function getSessionProfile() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, profile: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile };
}

export async function assertStaff() {
  const session = await getSessionProfile();
  if (!session.user || !STAFF.includes(session.profile?.role)) {
    return { error: "Non autorisé.", session: null };
  }
  return { error: null, session };
}

export async function assertAdmin() {
  const session = await getSessionProfile();
  if (!session.user || session.profile?.role !== "admin") {
    return { error: "Réservé à l'administrateur.", session: null };
  }
  return { error: null, session };
}
