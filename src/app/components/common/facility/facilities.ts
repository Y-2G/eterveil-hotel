export const facilities = [
  {
    id: "guest-rooms",
    badge: "Guest Rooms",
    floorLabel: "12–34F",
    title: "Where the living room meets the horizon",
    description:
      "Expansive oceanfront suites where the living space opens directly onto the endless blue. Morning light spills across warm wooden floors and soft textiles, blurring the boundary between your room and the sea beyond.",
    // 👇 ここは手元の客室画像に差し替えてOK
    mainImage: "/images/concept/room-dummy1.png",
    mainImageAlt: "Oceanfront suite living room with panoramic sea view",
    galleryImages: [
      {
        url: "/images/facilities/ocean-suite-living.jpg",
        alt: "Spacious living area with lounge chairs",
      },
      {
        url: "/images/facilities/ocean-suite-dining.jpg",
        alt: "Dining table beside the window overlooking the ocean",
      },
      {
        url: "/images/facilities/ocean-suite-bedroom.jpg",
        alt: "Bedroom with soft lighting and ocean view",
      },
      {
        url: "/images/facilities/ocean-suite-terrace.jpg",
        alt: "Private terrace with seating facing the shoreline",
      },
    ],
    details: {
      hours: "Check-in Whenever you are ready",
      location: "12–34F, ocean-facing tower",
      reservation:
        "Upgrades, extended stays and connecting rooms available upon request",
    },
    highlights: [
      "Floor-to-ceiling windows that frame the coastline from living room to bedroom",
      "Warm wood, stone textures and layered fabrics that soften the boundary between indoors and sea",
      "Thoughtful amenities from turn-down service to in-room dining designed for unhurried stays",
    ],
    note: "Please note: Smoking is only permitted in designated areas. For families or longer stays, connecting rooms and extra bedding can be arranged in advance.",
  },
  {
    id: "pool-spa",
    badge: "Pool & Spa",
    floorLabel: "23F",
    title: "Drift at the same height as the sea",
    description:
      "Suspended between sky and ocean, our infinity pool merges seamlessly with the horizon. The spa offers restorative treatments inspired by the rhythm of tides, where time feels both suspended and eternal.",
    mainImage:
      "https://images.unsplash.com/photo-1761138785118-cbdc66c7f0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbmZpbml0eSUyMHBvb2wlMjBuaWdodHxlbnwxfHx8fDE3NjM4NjYxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    mainImageAlt: "Infinity pool at night",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB0cmVhdG1lbnQlMjBsdXh1cnl8ZW58MXx8fHwxNzYzNzkwNDU2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Spa treatment luxury",
      },
      {
        url: "https://images.unsplash.com/photo-1701568129402-0d4541e3dab7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjBzdW5zZXR8ZW58MXx8fHwxNzYzODY2MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Hotel pool sunset",
      },
      {
        url: "https://images.unsplash.com/photo-1731336479432-3eb5fdb3ab1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjM4MzU2MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Luxury spa interior",
      },
      {
        url: "https://images.unsplash.com/flagged/photo-1569880286597-0019858e19d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmZpbml0eSUyMHBvb2wlMjBvY2VhbiUyMHZpZXd8ZW58MXx8fHwxNzYzODY2MTAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Infinity pool ocean view",
      },
    ],
    details: {
      hours: "Pool 7:00–22:00 / Spa treatments 10:00–20:00",
      location: "23F, ocean side",
      reservation: "Spa treatments by reservation (hotel guests only)",
    },
    highlights: [
      "Heated infinity pool with panoramic ocean views and underwater sound system",
      "Private treatment rooms with floor-to-ceiling windows overlooking the coast",
      'Signature "Tide Ritual" massage using locally harvested sea minerals and botanicals',
    ],
    note: "Please note: Pool access may be restricted during extreme weather conditions. Children under 12 must be accompanied by an adult at all times.",
  },
  {
    id: "fine-dining",
    badge: "Fine Dining",
    floorLabel: "42F",
    title: "Culinary Excellence Above the Clouds",
    description:
      "Perched at the pinnacle of the hotel, our Michelin-starred restaurant offers an unparalleled gastronomic journey. Each dish is a masterpiece, crafted by our award-winning chefs using the finest seasonal ingredients and innovative techniques.",
    mainImage: "/images/concept/meal-dummy1.png",
    mainImageAlt: "Fine dining restaurant with city lights",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1582127337900-d8a44e20b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGlzaCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjM4NjYxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Elegant dish presentation",
      },
      {
        url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZ3xlbnwxfHx8fDE3NjM4NjYxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Chef preparing gourmet food",
      },
      {
        url: "https://images.unsplash.com/photo-1519457031506-fd4dc2c16c89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwdGFzdGluZ3xlbnwxfHx8fDE3NjM4NjYxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Wine tasting collection",
      },
      {
        url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYzODY2MTAw&ixlib=rb-4.1.0&q=80&w=1080",
        alt: "Restaurant interior design",
      },
    ],
    details: {
      hours: "Dinner 18:00–23:00 (Closed Mondays)",
      location: "42F, main tower",
      reservation:
        "Reservations required 48 hours in advance (jacket required)",
    },
    highlights: [
      "Michelin-star chef with 20+ years of international culinary experience",
      "Seasonal tasting menu showcasing local and imported delicacies",
      "Extensive wine cellar with over 3,000 selections from around the world",
    ],
    note: "Dress code: Business casual minimum. Jacket required for gentlemen. Special dietary requirements can be accommodated with 24-hour notice.",
  },
];
