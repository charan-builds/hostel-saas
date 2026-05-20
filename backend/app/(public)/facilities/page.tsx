import { FeatureGrid } from "@/components/marketing/feature-grid";

export default function FacilitiesPage() {
  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-24 pb-12 relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm font-bold tracking-[0.2em] text-primary backdrop-blur-md uppercase shadow-[0_0_20px_rgba(14,165,233,0.1)]">
          Amenities
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          World-Class Facilities
        </h1>
        <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          We provide everything you need to succeed academically and enjoy a vibrant student life.
        </p>
      </div>
      <FeatureGrid />
    </div>
  );
}
