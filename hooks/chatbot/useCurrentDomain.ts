import { onGetCurrentDomainInfo } from "@/actions/settings";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useCurrentDomain = () => {
  const pathname = usePathname();
  const [domainId, setDomainId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getDomainId = async () => {
      try {
        setLoading(true);
        // Extract domain name from pathname
        const pathParts = pathname.split("/");
        const domainName = pathParts[pathParts.length - 1];

        console.log("🔍 Extracting domain name from pathname:", domainName);

        if (domainName && domainName !== "chatbot") {
          const domainInfo = await onGetCurrentDomainInfo(domainName);
          if (domainInfo?.domains?.[0]?.id) {
            const id = domainInfo.domains[0].id;
            console.log("🔍 Found domain ID:", id);
            setDomainId(id);
          }
        }
      } catch (error) {
        console.error("Error getting domain ID:", error);
      } finally {
        setLoading(false);
      }
    };

    getDomainId();
  }, [pathname]);

  return { domainId, loading };
};
