import LoginForm from "./LoginForm";
import { getSessionProfile } from "@/lib/auth";

export const metadata = {
  title: "Connexion",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { user, profile } = await getSessionProfile();
  const staff = profile && ["admin", "directeur"].includes(profile.role);
  const denied = Boolean(user && !staff) || params?.erreur === "acces";

  return <LoginForm configured={configured} denied={denied} />;
}
