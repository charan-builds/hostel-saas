export const publicContent = {
  hero: {
    badge: "BOYS HOSTEL — PULIVENDULA",
    heading: "Sadhana Boys Hostel",
    description: "Safe accommodation for students and working professionals near Loyola Polytechnic College.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop",
    primaryCTA: { text: "Call Now", href: "tel:+917013762904" },
    secondaryCTA: { text: "WhatsApp", href: "https://wa.me/919346131788" },
    stats: [
      { label: "Students / Month", value: "₹3,500" },
      { label: "Employees / Month", value: "₹5,000" },
      { label: "Water Supply", value: "24/7" },
    ],
    trustBadges: [
      "Tasty Food",
      "High Speed WiFi",
      "CCTV Protected",
      "Safe & Clean",
      "Parking",
    ],
    occupancy: "100%",
    rating: "4.8",
    startingPrice: "₹3,500/mo",
  },
  about: {
    badge: "About Sadhana Boys Hostel",
    heroTitle: "A Safe & Comfortable Place To Stay.",
    heroSubtitle: "Providing clean, affordable and student-friendly accommodation near Loyola Polytechnic College.",
    storyTitle: "Our Story",
    storyParagraphs: [
      "Sadhana Boys Hostel is dedicated to providing a comfortable and safe living environment for students and working professionals in Pulivendula.",
      "We understand that moving away from home can be challenging. That's why we focus on creating a supportive community where you can focus on your studies and career while we take care of your daily needs. From hygienic food to 24/7 security, everything is designed with your peace of mind as our priority."
    ],
    storyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
    locationBadge: "Prime Location",
    locationHighlights: [
      "Near Loyola Polytechnic College",
      "Palem Street",
      "Royals Road",
      "Near New Gangireddy Hospital"
    ],
    locationNote: "⚠️ We are NOT near CKG College.",
    studentsDescription: "Quiet, focused environments perfect for studying. Close to major educational institutions like Loyola Polytechnic College. Includes high-speed WiFi for online classes and research.",
    professionalsDescription: "Hassle-free living with flexible timings. Enjoy a peaceful rest after a long day at work. Prime location allows for easy daily commutes to offices and hospitals.",
  },
  facilities: [
    {
      title: "Tasty Food",
      description: "Hygienic and delicious home-style meals served daily.",
      icon: "utensils", // mapped dynamically in the component
    },
    {
      title: "High-Speed Wi-Fi",
      description: "Stay connected with fast internet throughout the hostel.",
      icon: "wifi",
    },
    {
      title: "CCTV Security",
      description: "24/7 surveillance for your peace of mind and safety.",
      icon: "shield",
    },
    {
      title: "24/7 Water Supply",
      description: "Continuous running water available round the clock.",
      icon: "droplet",
    },
    {
      title: "Safe & Clean",
      description: "Daily housekeeping ensuring a neat and hygienic environment.",
      icon: "sparkles",
    },
    {
      title: "Vehicle Parking",
      description: "Secure parking space for your two-wheelers.",
      icon: "car",
    },
  ],
  roomTypes: [
    {
      id: "students",
      title: "For Students",
      description: "Comfortable and focused environment ideal for studying.",
      price: "₹3,500",
      period: "per month",
      capacity: 4,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
      features: ["Spacious rooms", "Study tables", "High-speed Wi-Fi", "Daily housekeeping", "Tasty Food"],
    },
    {
      id: "employees",
      title: "For Employees",
      description: "Premium and peaceful space to relax after a long workday.",
      price: "₹5,000",
      period: "per month",
      capacity: 2,
      popular: true,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop",
      features: ["Less crowding", "Premium beds", "High-speed Wi-Fi", "Daily housekeeping", "Tasty Food"],
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
  ],
  contact: {
    badge: "Contact Us",
    title: "Get in Touch",
    subtitle: "Have questions? Our admissions team is here to help you every step of the way.",
    formSubtitle: "Fill out the form and our team will get back to you within 24 hours.",
    imageBg: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"
  },
  terms: {
    badge: "Legal",
    title: "Terms & Conditions",
    intro: "Welcome to Sadhana Boys Hostel. By residing here, you agree to the following terms and conditions.",
    sections: [
      {
        title: "1. Admission & Rent",
        rules: [
          "Rent must be paid within the first 5 days of every month.",
          "A refundable security deposit is required at the time of admission.",
          "A minimum notice period of 15 days must be given before vacating the hostel."
        ]
      },
      {
        title: "2. Rules & Regulations",
        rules: [
          "Strict discipline must be maintained within the hostel premises.",
          "Alcohol, smoking, and the use of illegal substances are strictly prohibited.",
          "Outsiders or guests are not allowed to stay overnight in the hostel rooms."
        ]
      },
      {
        title: "3. Damage & Loss",
        rules: [
          "Residents are responsible for the safety of their personal belongings.",
          "Any damage to hostel property will be charged to the respective resident(s)."
        ]
      }
    ]
  },
  location: {
    badge: "Prime Location",
    title: "Find Us Easily",
    description: "Conveniently located near Loyola Polytechnic College (Diploma College) for easy access to your classes.",
    note: "We are NOT near CKG College.",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15446.495034608311!2d78.2215352!3d14.4200631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb3b13689454179%3A0xe9cc38ef877402!2sPulivendula%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
  }
};
