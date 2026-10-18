import { Suspense } from "react";
import { getSettings, getSizes } from "@/lib/data";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header, HeaderWithPath } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { PackTrayGate } from "@/components/store/pack-tray";
import { StoreDataProvider } from "@/components/store/store-data";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, sizes] = await Promise.all([getSettings(), getSizes()]);

  return (
    <StoreDataProvider value={{ settings, sizes }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:text-paper focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>
      <AnnouncementBar settings={settings} />
      <Suspense fallback={<Header pathname={null} />}>
        <HeaderWithPath />
      </Suspense>
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} />
      <CartDrawer />
      <Suspense>
        <PackTrayGate />
      </Suspense>
    </StoreDataProvider>
  );
}
