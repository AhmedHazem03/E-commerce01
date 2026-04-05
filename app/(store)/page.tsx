import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/organisms/HeroSection";
import SocialProofBar from "@/components/molecules/SocialProofBar";
import CategoryGrid from "@/components/organisms/CategoryGrid";
import BestSellers from "@/components/organisms/BestSellers";
import TrustSection from "@/components/organisms/TrustSection";
import FinalCTA from "@/components/organisms/FinalCTA";
import ProductGridSkeleton from "@/components/organisms/ProductGridSkeleton";
import {
  DynamicScrollytelling,
  DynamicUGCWall,
  DynamicStickyMobileCTA,
} from "@/components/organisms/DynamicClientSections";
import { UGCHeader } from "@/components/organisms/UGCWall";

export const metadata: Metadata = {
  title: "متجر الأزياء المصرية الفاخرة | ملابس وإكسسوارات وهدايا",
  description:
    "اكتشفي أحدث تشكيلات الأزياء المصرية الفاخرة. ملابس، إكسسوارات، وهدايا بأسعار مناسبة مع شحن سريع لكل مكان في مصر.",
  openGraph: {
    title: "متجر الأزياء المصرية الفاخرة",
    description:
      "اكتشفي أحدث تشكيلات الأزياء المصرية الفاخرة. شحن سريع لكل مكان في مصر.",
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1287&auto=format&fit=crop"],
    locale: "ar_EG",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main dir="rtl">
      <HeroSection 
        slides={[
          { headline: "أناقة تعانق السحاب", imageSrc: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1200&auto=format&fit=crop" },
          { headline: "اكتشفي سحرك الخاص", imageSrc: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" },
          { headline: "تفاصيل تروي فخامتك", imageSrc: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop" }
        ]} 
      />
      <SocialProofBar />
      <CategoryGrid />
      <DynamicScrollytelling />
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <BestSellers />
      </Suspense>
      <TrustSection />
      {/* UGCHeader: Server Component — مفهرَس بمحركات البحث */}
      <UGCHeader />
      {/* UGCWall: Client Component — الـ Swiper يتحمّل lazily */}
      <DynamicUGCWall />
      <FinalCTA />
      <DynamicStickyMobileCTA />
    </main>
  );
}

