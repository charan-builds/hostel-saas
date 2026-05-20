import { getTenantCMS } from "@/lib/tenant/cms";
import { ContactForm } from "@/components/marketing/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { websiteConfig } = await getTenantCMS();
  return {
    title: `Contact | ${websiteConfig.name}`,
    description: `Get in touch with ${websiteConfig.name}.`,
  };
}

export default async function ContactPage() {
  const { websiteConfig, publicContent } = await getTenantCMS();
  const { contact } = publicContent;

  return (
    <div className="pt-32 pb-20 md:pt-48 md:pb-32 bg-slate-950 min-h-screen relative overflow-hidden">
      {/* Ambient cinematic lighting - softened */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0EA5E9]/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F97316]/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 md:pt-16 md:pb-20 text-center relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#0EA5E9] backdrop-blur-md uppercase shadow-sm">
          {contact.badge}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
          {contact.title}
        </h1>
        <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
          {contact.subtitle}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-0 bg-slate-900/80 backdrop-blur-lg rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20">
          <div className="p-8 md:p-14 lg:p-16 bg-gradient-to-br from-[#0EA5E9]/10 to-transparent border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-cover opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('${contact.imageBg}')` }} />
            
            <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4 md:mb-6 text-white relative z-10">Contact Information</h2>
            <p className="text-white/70 mb-10 md:mb-12 relative z-10 text-base md:text-lg font-light leading-relaxed">
              {contact.formSubtitle}
            </p>
            
            <div className="space-y-8 md:space-y-10 relative z-10">
              <div className="flex items-start group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center mr-5 md:mr-6 shrink-0 group-hover:bg-[#0EA5E9] transition-all duration-500 border border-white/20 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-lg">Phone</h3>
                  <a href={`tel:${websiteConfig.contact.phone}`} className="mt-1 text-white/70 hover:text-[#0EA5E9] transition-colors block text-base md:text-lg font-light">{websiteConfig.contact.phone}</a>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center mr-5 md:mr-6 shrink-0 group-hover:bg-[#0EA5E9] transition-all duration-500 border border-white/20 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-lg">Email</h3>
                  <a href={`mailto:${websiteConfig.contact.email}`} className="mt-1 text-white/70 hover:text-[#0EA5E9] transition-colors block text-base md:text-lg font-light">{websiteConfig.contact.email}</a>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center mr-5 md:mr-6 shrink-0 group-hover:bg-[#0EA5E9] transition-all duration-500 border border-white/20 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-lg">Location</h3>
                  <p className="mt-1 text-white/70 text-base md:text-lg leading-relaxed font-light">{websiteConfig.contact.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-14 lg:p-16 bg-slate-900/30 flex flex-col justify-center">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
