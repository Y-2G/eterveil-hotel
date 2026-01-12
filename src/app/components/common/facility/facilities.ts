export const facilities = [
  {
    id: "guest-rooms",
    badge: "Guest Rooms",
    floorLabel: "12–34F",
    title: "Where the living room meets the horizon",
    description:
      "Expansive oceanfront suites where the living space opens directly onto the endless blue. Morning light spills across warm wooden floors and soft textiles, blurring the boundary between your room and the sea beyond.",
    // 👇 ここは手元の客室画像に差し替えてOK
    mainImage: "/images/facilities/room-dummy1.png",
    mainImageAlt: "Oceanfront suite living room with panoramic sea view",
    galleryImages: [
      {
        url: "/images/facilities/room-dummy2.png",
        alt: "Spacious living area with lounge chairs",
      },
      {
        url: "/images/facilities/room-dummy3.png",
        alt: "Dining table beside the window overlooking the ocean",
      },
      {
        url: "/images/facilities/room-dummy4.png",
        alt: "Bedroom with soft lighting and ocean view",
      },
      {
        url: "/images/facilities/room-dummy5.png",
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
    mainImage: "/images/facilities/bath-dummy1.png",
    mainImageAlt: "Infinity pool at night",
    galleryImages: [
      {
        url: "/images/facilities/bath-dummy2.png",
        alt: "Spa treatment luxury",
      },
      {
        url: "/images/facilities/bath-dummy3.png",
        alt: "Hotel pool sunset",
      },
      {
        url: "/images/facilities/bath-dummy4.png",
        alt: "Luxury spa interior",
      },
      {
        url: "/images/facilities/bath-dummy5.png",
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
    mainImage: "/images/facilities/meal-dummy1.png",
    mainImageAlt: "Fine dining restaurant with city lights",
    galleryImages: [
      {
        url: "/images/facilities/meal-dummy2.png",
        alt: "Elegant dish presentation",
      },
      {
        url: "/images/facilities/meal-dummy3.png",
        alt: "Chef preparing gourmet food",
      },
      {
        url: "/images/facilities/meal-dummy4.png",
        alt: "Wine tasting collection",
      },
      {
        url: "/images/facilities/meal-dummy5.png",
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
