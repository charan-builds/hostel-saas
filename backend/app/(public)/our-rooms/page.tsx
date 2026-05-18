import { RoomShowcase } from "@/components/marketing/room-showcase";

export default function RoomsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-16 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Explore Our Rooms
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Thoughtfully designed spaces for privacy, focus, and comfort.
        </p>
      </div>
      <RoomShowcase />
    </div>
  );
}
