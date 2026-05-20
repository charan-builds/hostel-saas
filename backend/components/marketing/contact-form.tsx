"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { Loader2 } from "lucide-react";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitEnquiry, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6 md:space-y-8">
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-xs md:text-sm font-bold text-white/80 mb-2 md:mb-3 tracking-wide uppercase">Full Name</label>
        <input 
          type="text" 
          id="name" 
          name="name"
          required
          disabled={isPending}
          className="block w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 md:px-5 md:py-4 text-base md:text-lg font-light placeholder-white/30 text-white focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all disabled:opacity-50" 
          placeholder="John Doe" 
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-xs md:text-sm font-bold text-white/80 mb-2 md:mb-3 tracking-wide uppercase">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email"
          required
          disabled={isPending}
          className="block w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 md:px-5 md:py-4 text-base md:text-lg font-light placeholder-white/30 text-white focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all disabled:opacity-50" 
          placeholder="john@example.com" 
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-xs md:text-sm font-bold text-white/80 mb-2 md:mb-3 tracking-wide uppercase">Message</label>
        <textarea 
          id="message" 
          name="message"
          rows={5} 
          required
          disabled={isPending}
          className="block w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 md:px-5 md:py-4 text-base md:text-lg font-light placeholder-white/30 text-white focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all resize-none disabled:opacity-50" 
          placeholder="How can we help you?"
        ></textarea>
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-6 py-4 md:py-5 text-base md:text-lg font-bold text-white shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_40px_rgba(14,165,233,0.5)] hover:-translate-y-1 hover:bg-[#0EA5E9]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
