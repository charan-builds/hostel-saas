import { Home, Info, Phone, BedDouble, Building, Image as ImageIcon } from "lucide-react";

export const websiteConfig = {
  name: "Sadhana Boys Hostel",
  tagline: "Safe, Neat & Affordable Accommodation",
  description: "Safe accommodation for students and working professionals near Loyola Polytechnic College.",
  logo: "Hostel Logo", // Can be text or image URL
  contact: {
    email: "contact@hostel.com",
    phone: "+1 (555) 123-4567",
    whatsapp: "+1 (555) 987-6543",
    address: "123 Premium Avenue, Hospitality District, 10001",
    mapsLink: "https://maps.google.com",
  },
  links: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    github: "https://github.com",
  },
  mainNav: [
    { title: "Home", href: "/", icon: Home },
    { title: "Rooms", href: "/our-rooms", icon: BedDouble },
    { title: "Facilities", href: "/facilities", icon: Building },
    { title: "Pricing", href: "/pricing" },
    { title: "Gallery", href: "/gallery", icon: ImageIcon },
    { title: "About", href: "/about", icon: Info },
    { title: "Contact", href: "/contact", icon: Phone },
  ],
} as const;
