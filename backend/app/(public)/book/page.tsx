"use client";

import { useSearchParams } from "next/navigation";
import { websiteConfig } from "@/config/website-config";
import { publicContent } from "@/config/public-content";

export default function BookPage() {
  const searchParams = useSearchParams();
  const selectedRoomId = searchParams.get("room");
  
  return (
    <div className="pt-24 pb-16 bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Book Your Space
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
          Secure your spot at {websiteConfig.name} for the upcoming semester.
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white dark:bg-slate-950 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input type="email" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                <input type="tel" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room Preference</label>
              <select 
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                defaultValue={selectedRoomId || ""}
              >
                <option value="" disabled>Select a room type...</option>
                {publicContent.roomTypes.map(room => (
                  <option key={room.id} value={room.id}>{room.title} - {room.price}/mo</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Move-in Date</label>
              <input type="date" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>

            <div className="pt-4">
              <button type="button" className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Submit Application
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">
                No payment required at this step. Our team will contact you to confirm availability.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
