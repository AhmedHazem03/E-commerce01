import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/organisms/HeroSection";

export const dynamic = "force-dynamic";
import SocialProofBar from "@/components/molecules/SocialProofBar";
import CategoryGrid from "@/components/organisms/CategoryGrid";
import BestSellers from "@/components/organisms/BestSellers";
import TrustSection from "@/components/organisms/TrustSection";
import FinalCTA from "@/components/organisms/FinalCTA";
import ProductGridSkeleton from "@/components/organisms/ProductGridSkeleton";
import NewArrivals from "@/components/organisms/NewArrivals";
import OffersSection from "@/components/organisms/OffersSection";
import FlashSale from "@/components/organisms/FlashSale";
import BrandStory from "@/components/organisms/BrandStory";
import {
  DynamicScrollytelling,
  DynamicUGCWall,
  DynamicStickyMobileCTA,
  DynamicAnnouncementBar,
  DynamicMarqueeTicker,
} from "@/components/organisms/DynamicClientSections";
import { UGCHeader } from "@/components/organisms/UGCWall";
import { getStoreSettings } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "متجر الملابس الفاخرة | فساتين وعبايات وبلوزات",
  description:
    "اكتشفي أحدث تشكيلات الملابس الفاخرة. فساتين، عبايات، بلوزات، وبناطيل بأسعار مناسبة مع شحن سريع لكل مكان في مصر.",
  openGraph: {
    title: "متجر الأزياء المصرية الفاخرة",
    description:
      "اكتشفي أحدث تشكيلات الأزياء المصرية الفاخرة. شحن سريع لكل مكان في مصر.",
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1287&auto=format&fit=crop"],
    locale: "ar_EG",
    type: "website",
  },
};

export default async function HomePage() {
  const settings = await getStoreSettings();
  const lp = settings.landingPage;

  return (
    <main dir="rtl">
      {/* ── Announcement Bar ── */}
      {lp.announcementBar.enabled && (
        <DynamicAnnouncementBar text={lp.announcementBar.text} />
      )}

      {/* ── Hero ── */}
      <HeroSection
        slides={[
          { headline: "أناقة تعانق السحاب", imageSrc: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1200&auto=format&fit=crop" },
          { headline: "اكتشفي سحرك الخاص", imageSrc: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" },
          { headline: "تفاصيل تروي فخامتك", imageSrc: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop" },
        ]}
      />

      {/* ── Marquee Ticker ── */}
      {lp.marquee.enabled && (
        <DynamicMarqueeTicker items={lp.marquee.items} />
      )}

      <SocialProofBar />
      <CategoryGrid />

      {/* ── New Arrivals ── */}
      {lp.newArrivals.enabled && (
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <NewArrivals title={lp.newArrivals.title} limit={lp.newArrivals.limit} />
        </Suspense>
      )}

      {/* ── Flash Sale ── */}
      {lp.flashSale.enabled && (
        <Suspense fallback={<div className="w-full bg-walnut" style={{ minHeight: "400px" }} />}>
          <FlashSale title={lp.flashSale.title} endsAt={lp.flashSale.endsAt} />
        </Suspense>
      )}

      <DynamicScrollytelling />

      {/* ── Best Sellers ── */}
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <BestSellers />
      </Suspense>

      {/* ── Offers & Discounts ── */}
      {lp.offersSection.enabled && (
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <OffersSection title={lp.offersSection.title} limit={lp.offersSection.limit} />
        </Suspense>
      )}

      {/* ── Brand Story ── */}
      {lp.brandStory.enabled && (
        <BrandStory
          headline={lp.brandStory.headline}
          body={lp.brandStory.body}
          image={lp.brandStory.image}
        />
      )}

      <TrustSection />

      {/* ── UGC Wall ── */}
      <UGCHeader />
      <DynamicUGCWall />

      <FinalCTA />
      <DynamicStickyMobileCTA />
    </main>
  );
}


