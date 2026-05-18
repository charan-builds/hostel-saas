export const publicContent = {
  hero: {
    badge: "Premium Experience",
    heading: "Experience true hospitality.",
    description: "Discover a sanctuary designed for comfort and connection. Your home away from home.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop",
    primaryCTA: { text: "Book a Visit", href: "/book" },
    secondaryCTA: { text: "WhatsApp Us", href: "/contact" },
    stats: [
      { label: "Happy Residents", value: "2000+" },
      { label: "Locations", value: "3" },
    ],
    trustBadges: [
      "CCTV Protected",
      "High Speed WiFi",
      "Hygienic Food",
      "Near Colleges",
      "24/7 Support",
    ],
    occupancy: "99%",
    rating: "4.9",
    startingPrice: "$500/mo",
  },
  facilities: [
    {
      title: "High-Speed Wi-Fi",
      description: "Stay connected with enterprise-grade internet throughout the property.",
      icon: "wifi",
    },
    {
      title: "Premium Security",
      description: "24/7 surveillance and secure access for your peace of mind.",
      icon: "shield",
    },
    {
      title: "Gourmet Dining",
      description: "Daily chef-prepared meals using locally sourced ingredients.",
      icon: "utensils",
    },
  ],
  roomTypes: [
    {
      id: "private-suite",
      title: "Private Suite",
      description: "Complete privacy with your own room, study area, and attached bathroom.",
      price: "$800",
      period: "per month",
      capacity: 1,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
      features: ["Queen size bed", "Private bathroom", "Study desk", "Air conditioning"],
    },
    {
      id: "twin-sharing",
      title: "Twin Sharing",
      description: "Share with a friend in our spacious twin rooms.",
      price: "$500",
      period: "per month",
      capacity: 2,
      popular: true,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop",
      features: ["Two single beds", "Attached bathroom", "Individual wardrobes", "Air conditioning"],
    },
  ],
  testimonials: [
    {
      quote: "The attention to detail here is incredible. It truly feels like a premium hotel.",
      author: "Sarah J.",
      role: "Resident",
      avatar: "SJ",
    },
    {
      quote: "Peaceful, elegant, and perfectly located. I couldn't ask for a better place to stay.",
      author: "Michael C.",
      role: "Resident",
      avatar: "MC",
    },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
  ],
  faqs: [
    {
      question: "Are utilities included in the rent?",
      answer: "Yes, all utilities are seamlessly included in your monthly rate for a hassle-free experience."
    },
    {
      question: "Is there a curfew?",
      answer: "We offer 24/7 secure access via personalized keycards, so you can come and go as you please."
    }
  ]
};
