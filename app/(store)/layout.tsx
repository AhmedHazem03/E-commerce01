import type { ReactNode } from "react";
import StoreClientWrapper from "@/components/templates/StoreClientWrapper";
import { getStoreSettings } from "@/lib/services/settings.service";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <StoreClientWrapper settings={settings}>
      {children}
    </StoreClientWrapper>
  );
}
