import { websiteConfig } from "@/config/website-config";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16 bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Get in Touch
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Have questions? Our admissions team is here to help you every step of the way.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid md:grid-cols-2 gap-12 bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="p-8 md:p-12 bg-primary text-white">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <p className="text-primary-foreground/80 mb-12">
              Fill out the form and our team will get back to you within 24 hours.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <Phone className="h-6 w-6 mr-4 shrink-0 text-white/80" />
                <div>
                  <h3 className="font-semibold text-white">Phone</h3>
                  <p className="mt-1 text-white/80">{websiteConfig.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 mr-4 shrink-0 text-white/80" />
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="mt-1 text-white/80">{websiteConfig.contact.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-6 w-6 mr-4 shrink-0 text-white/80" />
                <div>
                  <h3 className="font-semibold text-white">Location</h3>
                  <p className="mt-1 text-white/80">{websiteConfig.contact.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input type="text" id="name" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input type="email" id="email" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
