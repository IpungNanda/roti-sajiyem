export default function LocalBusinessSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Bakery",

    "@id": "https://rotisajiyem.com/#business",

    name: "Roti Sajiyem Bakery",

    url: "https://rotisajiyem.com/",

    description:
      "Roti Sajiyem Bakery adalah usaha roti dan bolu yang berlokasi di Jalan Jetis, Blimbing, Gatak, Kabupaten Sukoharjo, Jawa Tengah.",

    telephone: "+6285725223888",

    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Jalan Jetis, RT.01/RW.09, Dusun III, Blimbing",
      addressLocality: "Gatak",
      addressRegion: "Jawa Tengah",
      postalCode: "57557",
      addressCountry: "ID",
    },

    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "07:00",
        closes: "21:00",
      },
    ],

    servesCuisine: "Bakery",

    priceRange: "Rp",

    areaServed: {
      "@type": "AdministrativeArea",
      name: "Sukoharjo",
    },

    sameAs: [
      "https://rotisajiyem.com/",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}