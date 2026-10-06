export interface BusinessCategoryInfo {
  id: string;
  name: string;
  aliases: string[];
  thumbnail: string;
  svgThumbnail: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  tagline: string;
  iconName: string;
}

// Inline SVG generator for zero-latency, 100% offline visual thumbnails
function createSvgDataUri(
  _title: string,
  emoji: string,
  gradientStart: string,
  gradientEnd: string,
  _accentColor?: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}" />
        <stop offset="100%" stop-color="${gradientEnd}" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.04)" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.22)" />
      </filter>
    </defs>
    <rect width="200" height="200" rx="36" fill="url(#bg)" />
    <!-- Glassmorphic Central Pod (borderless) -->
    <rect x="24" y="24" width="152" height="152" rx="28" fill="url(#cardGrad)" filter="url(#shadow)" />
    <!-- Review Stars Pod -->
    <g transform="translate(100, 62)">
      <circle cx="-32" cy="0" r="4.5" fill="#FBBF24" />
      <circle cx="-16" cy="0" r="5" fill="#FBBF24" />
      <circle cx="0" cy="0" r="5.5" fill="#FBBF24" />
      <circle cx="16" cy="0" r="5" fill="#FBBF24" />
      <circle cx="32" cy="0" r="4.5" fill="#FBBF24" />
    </g>
    <!-- Central Category Icon Emoji -->
    <text x="100" y="126" font-size="58" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CATEGORY_SVG_FILES: Record<string, string> = {
  'cafe-restaurant': '/categories/cafe-restaurant.svg',
  'healthcare-wellness': '/categories/healthcare-wellness.svg',
  'salon-spa': '/categories/salon-spa.svg',
  'retail-fashion': '/categories/retail-fashion.svg',
  'automotive-garage': '/categories/automotive-garage.svg',
  'hospitality-hotels': '/categories/hospitality-hotels.svg',
  'fitness-gym': '/categories/fitness-gym.svg',
  'legal-finance': '/categories/legal-finance.svg',
  'jewellery-luxury': '/categories/jewellery-luxury.svg',
  'real-estate': '/categories/real-estate.svg',
  'education-coaching': '/categories/education-coaching.svg',
  'grocery-supermarket': '/categories/grocery-supermarket.svg',
  'tech-electronics': '/categories/tech-mobile.svg',
  'pet-veterinary': '/categories/pet-care.svg',
  'entertainment-events': '/categories/entertainment-gaming.svg',
  'general-services': '/categories/default-business.svg',
};

export const BUSINESS_CATEGORIES: BusinessCategoryInfo[] = [
  {
    id: 'cafe-restaurant',
    name: 'Cafe & Restaurant',
    aliases: [
      'cafe',
      'restaurant',
      'dining',
      'hospitality & dining',
      'food',
      'coffee',
      'bakery',
      'bistro',
      'burger',
      'pizza',
      'bar',
      'pub',
      'dhaba',
      'sweet',
    ],
    thumbnail: '/categories/cafe-restaurant.svg',
    svgThumbnail: createSvgDataUri('CAFE & FOOD', '☕', '#F97316', '#DC2626', '#EA580C'),
    color: '#EA580C',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FFEDD5',
    tagline: 'Cafes, Dining, Bakeries & Restrobars',
    iconName: 'Utensils',
  },
  {
    id: 'healthcare-wellness',
    name: 'Healthcare & Wellness',
    aliases: [
      'dental',
      'healthcare',
      'dental & healthcare',
      'clinic',
      'doctor',
      'hospital',
      'pharmacy',
      'wellness',
      'dentist',
      'diagnostic',
      'health',
      'ortho',
      'ayurveda',
      'homeopathy',
    ],
    thumbnail: '/categories/healthcare-wellness.svg',
    svgThumbnail: createSvgDataUri('HEALTHCARE', '🩺', '#06B6D4', '#0284C7', '#0891B2'),
    color: '#0284C7',
    badgeBg: '#F0F9FF',
    badgeBorder: '#E0F2FE',
    tagline: 'Clinics, Dental Centers & Hospitals',
    iconName: 'Activity',
  },
  {
    id: 'salon-spa',
    name: 'Salon & Spa',
    aliases: [
      'salon',
      'spa',
      'beauty',
      'beauty & wellness',
      'parlour',
      'parlor',
      'barber',
      'hair',
      'skin',
      'cosmetic',
      'makeup',
      'aesthetic',
      'laser',
      'nails',
    ],
    thumbnail: '/categories/salon-spa.svg',
    svgThumbnail: createSvgDataUri('SALON & SPA', '💇', '#EC4899', '#9333EA', '#D946EF'),
    color: '#9333EA',
    badgeBg: '#FAF5FF',
    badgeBorder: '#F3E8FF',
    tagline: 'Beauty Parlours, Hair Studios & Spas',
    iconName: 'Sparkles',
  },
  {
    id: 'retail-fashion',
    name: 'Retail & Fashion',
    aliases: [
      'retail',
      'retail & fashion',
      'retail & showrooms',
      'fashion',
      'clothing',
      'apparel',
      'boutique',
      'store',
      'footwear',
      'shoes',
      'wear',
      'garments',
      'optician',
      'eyewear',
    ],
    thumbnail: '/categories/retail-fashion.svg',
    svgThumbnail: createSvgDataUri('RETAIL & STORE', '🛍️', '#6366F1', '#4338CA', '#4F46E5'),
    color: '#4F46E5',
    badgeBg: '#EEF2FF',
    badgeBorder: '#E0E7FF',
    tagline: 'Fashion Boutiques, Showrooms & Stores',
    iconName: 'ShoppingBag',
  },
  {
    id: 'automotive-garage',
    name: 'Automotive & Garage',
    aliases: [
      'automotive',
      'garage',
      'automotive & garage',
      'automotive & services',
      'car',
      'bike',
      'motor',
      'workshop',
      'mechanic',
      'detailing',
      'tyre',
      'service center',
      'auto',
    ],
    thumbnail: '/categories/automotive-garage.svg',
    svgThumbnail: createSvgDataUri('AUTOMOTIVE', '🚗', '#0284C7', '#1E293B', '#2563EB'),
    color: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeBorder: '#DBEAFE',
    tagline: 'Garages, Detailing & Service Centers',
    iconName: 'Wrench',
  },
  {
    id: 'hospitality-hotels',
    name: 'Hospitality & Hotels',
    aliases: [
      'hospitality',
      'hotel',
      'hospitality & hotels',
      'resort',
      'lodge',
      'stay',
      'homestay',
      'villa',
      'guest house',
      'inn',
      'motel',
    ],
    thumbnail: '/categories/hospitality-hotels.svg',
    svgThumbnail: createSvgDataUri('HOTEL & RESORT', '🏨', '#EAB308', '#B45309', '#D97706'),
    color: '#D97706',
    badgeBg: '#FEFCE8',
    badgeBorder: '#FEF08A',
    tagline: 'Hotels, Luxury Resorts & Homestays',
    iconName: 'Hotel',
  },
  {
    id: 'fitness-gym',
    name: 'Fitness & Gym',
    aliases: [
      'fitness',
      'gym',
      'crossfit',
      'workout',
      'yoga',
      'sports',
      'trainer',
      'martial arts',
      'pilates',
      'swimming',
      'athletics',
    ],
    thumbnail: '/categories/fitness-gym.svg',
    svgThumbnail: createSvgDataUri('FITNESS & GYM', '💪', '#10B981', '#047857', '#059669'),
    color: '#059669',
    badgeBg: '#ECFDF5',
    badgeBorder: '#A7F3D0',
    tagline: 'Gyms, Fitness Studios & Yoga Centers',
    iconName: 'Dumbbell',
  },
  {
    id: 'legal-finance',
    name: 'Legal & Finance',
    aliases: [
      'legal',
      'finance',
      'legal & finance',
      'lawyer',
      'advocate',
      'ca',
      'chartered accountant',
      'consultant',
      'tax',
      'audit',
      'advisory',
      'insurance',
      'bank',
    ],
    thumbnail: '/categories/legal-finance.svg',
    svgThumbnail: createSvgDataUri('LEGAL & FINANCE', '⚖️', '#475569', '#0F172A', '#334155'),
    color: '#334155',
    badgeBg: '#F8FAFC',
    badgeBorder: '#E2E8F0',
    tagline: 'Law Firms, CA Practices & Financial Consultancies',
    iconName: 'Shield',
  },
  {
    id: 'jewellery-luxury',
    name: 'Jewellery & Luxury',
    aliases: ['jewel', 'jewellery', 'jewelry', 'gold', 'diamond', 'silver', 'luxury', 'watch', 'gem'],
    thumbnail: '/categories/jewellery-luxury.svg',
    svgThumbnail: createSvgDataUri('JEWELLERY', '💎', '#F59E0B', '#78350F', '#B45309'),
    color: '#B45309',
    badgeBg: '#FFFBEB',
    badgeBorder: '#FDE68A',
    tagline: 'Gold, Diamond & Luxury Watch Boutiques',
    iconName: 'Gem',
  },
  {
    id: 'real-estate',
    name: 'Real Estate & Property',
    aliases: [
      'real estate',
      'property',
      'builder',
      'developer',
      'architect',
      'interior',
      'interiors',
      'construction',
      'housing',
    ],
    thumbnail: '/categories/real-estate.svg',
    svgThumbnail: createSvgDataUri('REAL ESTATE', '🏢', '#3B82F6', '#1D4ED8', '#1E40AF'),
    color: '#1D4ED8',
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
    tagline: 'Properties, Architects & Interior Designers',
    iconName: 'Building2',
  },
  {
    id: 'education-coaching',
    name: 'Education & Coaching',
    aliases: [
      'education',
      'coaching',
      'institute',
      'school',
      'college',
      'academy',
      'tuition',
      'classes',
      'training',
      'learning',
      'study',
    ],
    thumbnail: '/categories/education-coaching.svg',
    svgThumbnail: createSvgDataUri('EDUCATION', '🎓', '#F97316', '#C2410C', '#EA580C'),
    color: '#EA580C',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FED7AA',
    tagline: 'Coaching Institutes, Academies & Schools',
    iconName: 'GraduationCap',
  },
  {
    id: 'grocery-supermarket',
    name: 'Grocery & Supermarket',
    aliases: ['grocery', 'supermarket', 'mart', 'kirana', 'organic', 'vegetable', 'fruit', 'daily needs', 'fmcg'],
    thumbnail: '/categories/grocery-supermarket.svg',
    svgThumbnail: createSvgDataUri('GROCERY & MART', '🛒', '#84CC16', '#15803D', '#16A34A'),
    color: '#16A34A',
    badgeBg: '#F0FDF4',
    badgeBorder: '#BBF7D0',
    tagline: 'Supermarkets, Organic Marts & Daily Stores',
    iconName: 'Store',
  },
  {
    id: 'tech-electronics',
    name: 'Technology & Electronics',
    aliases: ['tech', 'technology', 'electronics', 'mobile', 'computer', 'laptop', 'gadgets', 'repair', 'it services'],
    thumbnail: '/categories/tech-mobile.svg',
    svgThumbnail: createSvgDataUri('TECH & MOBILE', '⚡', '#8B5CF6', '#4C1D95', '#6D28D9'),
    color: '#6D28D9',
    badgeBg: '#F5F3FF',
    badgeBorder: '#DDD6FE',
    tagline: 'Mobile Stores, Electronics & Repair Hubs',
    iconName: 'Cpu',
  },
  {
    id: 'pet-veterinary',
    name: 'Pet Care & Veterinary',
    aliases: ['pet', 'vet', 'veterinary', 'dog', 'cat', 'animal', 'pet clinic', 'grooming'],
    thumbnail: '/categories/pet-care.svg',
    svgThumbnail: createSvgDataUri('PET CARE', '🐾', '#FB923C', '#B91C1C', '#EA580C'),
    color: '#EA580C',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FFEDD5',
    tagline: 'Veterinary Clinics & Pet Grooming Salons',
    iconName: 'Heart',
  },
  {
    id: 'entertainment-events',
    name: 'Entertainment & Events',
    aliases: ['entertainment', 'events', 'cinema', 'theatre', 'gaming', 'lounge', 'party', 'wedding', 'photographer'],
    thumbnail: '/categories/entertainment-gaming.svg',
    svgThumbnail: createSvgDataUri('EVENTS & FUN', '🎉', '#F43F5E', '#881337', '#BE123C'),
    color: '#BE123C',
    badgeBg: '#FFF1F2',
    badgeBorder: '#FECDD3',
    tagline: 'Cinema, Lounges, Gaming & Event Planners',
    iconName: 'Film',
  },
  {
    id: 'general-services',
    name: 'Retail & Services',
    aliases: ['services', 'general', 'retail & services', 'other', 'unassigned', 'commercial', 'office'],
    thumbnail: '/categories/default-business.svg',
    svgThumbnail: createSvgDataUri('MODEXA VENUE', '⭐', '#0B63E5', '#1E40AF', '#0B63E5'),
    color: '#0B63E5',
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
    tagline: 'Professional Venues & Commercial Establishments',
    iconName: 'CreditCard',
  },
];

// Fallback default
export const DEFAULT_CATEGORY_INFO: BusinessCategoryInfo = BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1];

/**
 * Intelligent category matching:
 * Matches category name by keywords, aliases, or business name clues.
 */
export function getCategoryInfo(category?: string, businessName?: string): BusinessCategoryInfo {
  const cat = (category || '').trim().toLowerCase();
  const biz = (businessName || '').trim().toLowerCase();
  const combined = `${cat} ${biz}`.trim();

  if (!combined) {
    return DEFAULT_CATEGORY_INFO;
  }

  // 1. Exact match on category name
  const exact = BUSINESS_CATEGORIES.find((c) => c.name.toLowerCase() === cat);
  if (exact) return exact;

  // 2. Check aliases against category string first
  for (const item of BUSINESS_CATEGORIES) {
    for (const alias of item.aliases) {
      if (cat && (cat.includes(alias) || alias.includes(cat))) {
        return item;
      }
    }
  }

  // 3. Clues in business name
  for (const item of BUSINESS_CATEGORIES) {
    for (const alias of item.aliases) {
      if (biz && (biz.includes(alias) || alias.includes(biz))) {
        return item;
      }
    }
  }

  return DEFAULT_CATEGORY_INFO;
}

/**
 * Get dedicated category SVG vector path (from public/categories/*.svg)
 */
export function getCategorySvgPath(category?: string, businessName?: string): string {
  const info = getCategoryInfo(category, businessName);
  return CATEGORY_SVG_FILES[info.id] || '/categories/default-business.svg';
}

/**
 * Get the best thumbnail URL for a business category.
 * Strictly uses official Category SVG vector badges instead of stock photos.
 */
export function getCategoryThumbnail(category?: string, customThumbnail?: string, businessName?: string): string {
  // If a custom base64 / user uploaded image is present (and NOT stock unsplash), respect it
  if (customThumbnail && !customThumbnail.includes('unsplash.com') && customThumbnail.trim().startsWith('data:image')) {
    return customThumbnail.trim();
  }

  // Return the official crisp category SVG logo!
  return getCategorySvgPath(category, businessName);
}

/**
 * Get offline SVG vector data URI thumbnail for category
 */
export function getCategorySvgThumbnail(category?: string, businessName?: string): string {
  const info = getCategoryInfo(category, businessName);
  return info.svgThumbnail;
}
