import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicShell({ children }) {
  return (
    <div className="page-wrapper">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <div className="main-wrapper">
        <main id="contenu">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
