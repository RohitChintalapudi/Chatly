import { useEffect } from "react";
import { NotFoundGlitch } from "../components/not-found/NotFoundGlitch";
import { useAuthStore } from "../store/useAuthStore";

const NotFoundPage = () => {
  const { authUser } = useAuthStore();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "404 - Page Not Found | Chatly";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] pt-16 flex items-center justify-center bg-[var(--surface)] text-[var(--primary-text)] transition-colors">
      <NotFoundGlitch
        code="404"
        title="Signal Lost in Cyberspace"
        description="The frequency you dialed could not be found or has disintegrated. Recalibrate your coordinates below."
        homeHref="/"
        homeLabel={authUser ? "Back to Chat" : "Back to Home"}
        browseLabel="Previous Sector"
        statusBadge="STATUS_ALERT: 0x404_NOT_FOUND"
        showQuickHub={true}
      />
    </main>
  );
};

export default NotFoundPage;
