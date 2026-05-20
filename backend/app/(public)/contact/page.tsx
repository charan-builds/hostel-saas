import { websiteConfig } from "@/config/website-config";
import { publicContent } from "@/config/public-content";
import { Mail, Phone, MapPin } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Contact | ${websiteConfig.name}`,
    description: `Get in touch with ${websiteConfig.name}.`,
  };
}

export default function ContactPage() {
  const { contact } = publicContent;

  return (
    <div className="pt-32 pb-24 bg-slate-950 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-white/80 backdrop-blur-md uppercase shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          {contact.badge}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white drop-shadow-md">
          {contact.title}
        </h1>
        <p className="mt-6 text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          {contact.subtitle}
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-0 bg-slate-900 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
          <div className="p-10 md:p-14 bg-gradient-to-br from-primary/20 to-primary/5 border-r border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-cover opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('${contact.imageBg}')` }} />
            
            <h2 className="text-3xl font-heading font-bold mb-6 text-white relative z-10">Contact Information</h2>
            <p className="text-white/70 mb-12 relative z-10 text-lg">
              {contact.formSubtitle}
            </p>
            
            <div className="space-y-10 relative z-10">
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-primary transition-colors border border-white/10">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Phone</h3>
                  <a href={`tel:${websiteConfig.contact.phone}`} className="mt-1 text-white/70 hover:text-primary transition-colors block text-lg">{websiteConfig.contact.phone}</a>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-primary transition-colors border border-white/10">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Email</h3>
                  <a href={`mailto:${websiteConfig.contact.email}`} className="mt-1 text-white/70 hover:text-primary transition-colors block text-lg">{websiteConfig.contact.email}</a>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-5 shrink-0 group-hover:bg-primary transition-colors border border-white/10">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Location</h3>
                  <p className="mt-1 text-white/70 text-lg leading-relaxed">{websiteConfig.contact.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-10 md:p-14 bg-slate-900/50">
            <form className="space-y-8">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                <input type="text" id="name" className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base placeholder-white/30 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                <input type="email" id="email" className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base placeholder-white/30 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">Message</label>
                <textarea id="message" rows={4} className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base placeholder-white/30 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="w-full rounded-xl bg-primary px-4 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
