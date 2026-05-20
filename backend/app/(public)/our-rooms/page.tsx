import { RoomShowcase } from "@/components/marketing/room-showcase";

export default function RoomsPage() {
  return (
    <div className="pt-24 pb-16 bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-24 pb-12 relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-white/80 backdrop-blur-md uppercase shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          Accommodation
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
          Explore Our Rooms
        </h1>
        <p className="mt-6 text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
          Thoughtfully designed spaces for privacy, focus, and comfort.
        </p>
      </div>
      <RoomShowcase />
    </div>
  );
}
