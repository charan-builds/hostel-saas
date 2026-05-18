import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { RoomShowcase } from "@/components/marketing/room-showcase";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { TestimonialSlider } from "@/components/marketing/testimonial-slider";
import { GallerySection } from "@/components/marketing/gallery-section";
import { CTASection } from "@/components/marketing/cta-section";

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <RoomShowcase />
      <TestimonialSlider />
      <GallerySection />
      <PricingCards />
      <CTASection />
    </>
  );
}
