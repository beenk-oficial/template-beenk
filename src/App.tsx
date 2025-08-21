import { ToastProvider } from "@/components/ui/toast";
import { useWhitelabel } from "@/hooks/useWhitelabel";
import { useEffect, useState, type ReactNode } from "react";
import { Spinner } from "@/components/custom/Spinner";
import { useWhitelabelStore } from "@/stores/whitelabel";
import { useParams } from "react-router-dom";

type AppProps = {
  children: ReactNode;
};

export default function App({ children }: AppProps) {
  const { loadWhitelabel } = useWhitelabel();
  const [loading, setLoading] = useState(true);

  const setSlug = useWhitelabelStore((state) => state.setSlug);
  const setDomain = useWhitelabelStore((state) => state.setDomain);

  const { slug } = useParams();

  useEffect(() => {
    setSlug(slug || "");
    setDomain(window.location.hostname);

    loadWhitelabel({
      slug,
      domain: window.location.hostname,
    }).then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background/20">
        <Spinner />
      </div>
    );
  }

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
