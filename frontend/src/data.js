// Demo product data — now with multiple images per product.
export const Fallback = "https://placehold.co/1000x1200/jpg?text=Image";

export const PRODUCTS = [
  // MEN
  {
    id: "m-001",
    cat: "men",
    name: "AeroFlex Running Tee",
    price: 29.99,
    originalPrice: 49.99,
    images: ["/assets/men/aeroflex-tee-1.jpg", "/assets/men/aeroflex-tee-2.jpg"],
    desc: "Featherlight training tee with breathable mesh zones.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
  },

  {
    id: "m-002",
    cat: "men",
    name: "Core Training Shorts",
    price: 24.5,
    images: ["/assets/men/shorts-core-1.jpg", "/assets/men/shorts-core-2.jpg"],
    desc: 'Quick-dry 7" shorts with zip pocket.',
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
  },

  {
    id: "m-003",
    cat: "men",
    name: "Therma+ Hoodie",
    price: 49.0,
    originalPrice: 75.0,
    images: [
      "/assets/men/hoodie-therma-1.jpg",
      "/assets/men/hoodie-therma-2.jpg",
    ],
    desc: "Brushed fleece for cool days, athletic cut.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Charcoal", "Forest"],
  },

  {
    id: "m-004",
    cat: "men",
    name: "Studio Joggers",
    price: 39.0,
    images: [
      "/assets/men/joggers-studio-1.jpg",
      "/assets/men/joggers-studio-2.jpg",
    ],
    desc: "Tapered fit with rib cuffs and drawcord.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey Marl", "Ink"],
  },

  {
    id: "m-005",
    cat: "men",
    name: "All-Weather Jacket",
    price: 89.0,
    isNewArrival: true,
    images: [
      "/assets/men/jacket-allweather-1.jpg",
      "/assets/men/jacket-allweather-2.jpg",
    ],
    desc: "Light shell with storm flap and vents.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Pine"],
  },

  {
    id: "m-006",
    cat: "men",
    name: "Everyday Crew Socks (3-pack)",
    price: 12.0,
    isNewArrival: true,
    images: [
      "/assets/men/socks-everyday-1.jpg",
      "/assets/men/socks-everyday-2.jpg",
    ],
    desc: "Cushioned footbed and arch support.",
    sizes: ["M", "L"],
    colors: ["White", "Black"],
  },

  // WOMEN
  {
    id: "w-001",
    cat: "women",
    name: "AirLite Crop Tee",
    price: 27.99,
    originalPrice: 44.99,
    images: [
      "/assets/women/croptee-airlite-1.jpg",
      "/assets/women/croptee-airlite-2.jpg",
      "/assets/women/croptee-airlite-3.jpg",
    ],
    desc: "Ultra-soft crop with breathable panels.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Lilac", "Black", "Cream"],
  },

  {
    id: "w-002",
    cat: "women",
    name: "Sculpt Leggings 7/8",
    price: 42.0,
    isNewArrival: true,
    images: [
      "/assets/women/leggings-sculpt-1.jpg",
      "/assets/women/leggings-sculpt-2.jpg",
    ],
    desc: "High-rise, squat-proof, phone pocket.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Fig", "Sage"],
  },

  {
    id: "w-003",
    cat: "women",
    name: "Studio Wrap Hoodie",
    price: 55.0,
    images: [
      "/assets/women/hoodie-studiowrap-1.jpg",
      "/assets/women/hoodie-studiowrap-2.jpg",
    ],
    desc: "Relaxed wrap front, brushed interior.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Oat", "Black"],
  },

  {
    id: "w-004",
    cat: "women",
    name: "Trail Windbreaker",
    price: 79.0,
    isNewArrival: true,
    images: [
      "/assets/women/jacket-trailwind-1.jpg",
      "/assets/women/jacket-trailwind-2.jpg",
    ],
    desc: "PFC-free finish, packable hood.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Cinder", "Berry"],
  },

  {
    id: "w-005",
    cat: "women",
    name: "Heritage Denim Jacket",
    price: 59.0,
    images: [
      "/assets/women/jacket-denim-1.jpg",
      "/assets/women/jacket-denim-2.jpg",
    ],
    desc:
      "Classic denim jacket with structured seams and a modern tailored fit.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Light Wash", "Black"],
  },

  {
    id: "w-006",
    cat: "women",
    name: "Cloud Fleece Joggers",
    price: 44.0,
    originalPrice: 69.0,
    images: [
      "/assets/women/joggers-cloudfleece-1.jpg",
      "/assets/women/joggers-cloudfleece-2.jpg",
    ],
    desc: "Super-soft fleece with tapered leg.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Fog", "Navy"],
  },

  // KIDS
  {
    id: "k-001",
    cat: "kids",
    name: "Galaxy Graphic Tee",
    price: 14.99,
    originalPrice: 24.99,
    images: [
      "/assets/kids/tee-galaxy-1.jpg",
      "/assets/kids/tee-galaxy-2.jpg",
    ],
    desc: "Soft cotton tee with glow-in-the-dark galaxy print.",
    sizes: ["5-6", "7-8", "9-10", "11-12"],
    colors: ["Navy", "Moon"],
  },

  {
    id: "k-002",
    cat: "kids",
    name: "Playground Joggers",
    price: 19.5,
    images: [
      "/assets/kids/joggers-playground-1.jpg",
      "/assets/kids/joggers-playground-2.jpg",
    ],
    desc:
      "Durable joggers with knee panels for extra play-time protection.",
    sizes: ["5-6", "7-8", "9-10", "11-12"],
    colors: ["Grey Marl", "Black"],
  },

  {
    id: "k-003",
    cat: "kids",
    name: "Bright Day Hoodie",
    price: 24.99,
    originalPrice: 39.99,
    images: [
      "/assets/kids/hoodie-brightday-1.jpg",
      "/assets/kids/hoodie-brightday-2.jpg",
    ],
    desc: "Cozy overhead hoodie with kangaroo pocket.",
    sizes: ["5-6", "7-8", "9-10", "11-12"],
    colors: ["Sky Blue", "Red"],
  },

  {
    id: "k-004",
    cat: "kids",
    name: "Active Leggings",
    price: 17.0,
    images: [
      "/assets/kids/leggings-active-1.jpg",
      "/assets/kids/leggings-active-2.jpg",
    ],
    desc: "Stretch leggings for PE, dance, or everyday wear.",
    sizes: ["5-6", "7-8", "9-10", "11-12"],
    colors: ["Black", "Purple"],
  },

  {
    id: "k-005",
    cat: "kids",
    name: "All-Weather Shell",
    price: 34.99,
    isNewArrival: true,
    images: [
      "/assets/kids/jacket-shell-1.jpg",
      "/assets/kids/jacket-shell-2.jpg",
    ],
    desc:
      "Lightweight hooded shell for school and weekend adventures.",
    sizes: ["5-6", "7-8", "9-10", "11-12"],
    colors: ["Yellow", "Blue"],
  },

  {
    id: "k-006",
    cat: "kids",
    name: "Everyday Trainer Socks (5-pack)",
    price: 10.0,
    isNewArrival: true,
    images: [
      "/assets/kids/socks-trainer-1.jpg",
      "/assets/kids/socks-trainer-2.jpg",
    ],
    desc: "Cushioned ankle socks with soft ribbed cuffs.",
    sizes: ["5-8", "9-12"],
    colors: ["Multi", "White"],
  },

];
// Sale page    → products with originalPrice set (m-001, m-003, w-001, w-006, k-001, k-003)
// New Arrivals → products with isNewArrival: true (m-005, m-006, w-002, w-004, k-005, k-006)
