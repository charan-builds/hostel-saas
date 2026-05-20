import { getTenantCMS } from "@/lib/tenant/cms";

export async function LocalBusinessSchema() {
  const { websiteConfig, publicContent } = await getTenantCMS();
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Hostel", "LocalBusiness"],
    "name": websiteConfig.name,
    "image": publicContent.hero.image,
    "description": websiteConfig.description,
    "url": "https://sadhanaboyshostel.com", // Replace with dynamic URL in production
    "telephone": websiteConfig.contact.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Palem Street, Royals Road, Near New Gangireddy Hospital",
      "addressLocality": "Pulivendula",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "516390",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 14.417, // Approximate, update with exact coords
      "longitude": 78.233
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "priceRange": "₹",
    "amenityFeature": publicContent.facilities.map(facility => ({
      "@type": "LocationFeatureSpecification",
      "name": facility.title,
      "value": true
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
