import { Home, Info, Phone, BedDouble, Building, Image as ImageIcon, FileText } from "lucide-react";

export const websiteConfig = {
  name: "Sadhana Boys Hostel",
  tagline: "Safe, Neat & Affordable Accommodation",
  description: "Sadhana Boys Hostel offers safe, neat, and affordable accommodation for students and working professionals in Pulivendula, located near Loyola Polytechnic College.",
  logo: "Sadhana", // We'll style this as text in the navbar
  contact: {
    email: "contact@sadhanahostel.com",
    phone: "7013762904",
    whatsapp: "9346131788",
    address: "Palem Street, Royals Road, Near New Gangireddy Hospital, Pulivendula, Andhra Pradesh — 516390",
    mapsLink: "https://maps.google.com/?q=Sadhana+Boys+Hostel+Pulivendula",
  },
  links: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    github: "https://github.com",
  },
  mainNav: [
    { title: "Home", href: "/", icon: Home },
    { title: "About", href: "/about", icon: Info },
    { title: "Rooms", href: "/our-rooms", icon: BedDouble },
    { title: "Facilities", href: "/facilities", icon: Building },
    { title: "Gallery", href: "/gallery", icon: ImageIcon },
    { title: "Contact", href: "/contact", icon: Phone },
    { title: "Terms", href: "/terms", icon: FileText },
  ],
} as const;
