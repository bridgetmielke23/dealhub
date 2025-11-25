/**
 * SEO utilities and helpers for DealHub
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

export function generateDealSEO(deal: {
  storeName: string;
  title: string;
  category: string;
  discount: number;
  location: { city: string; state: string };
}): SEOData {
  return {
    title: `${deal.discount}% Off at ${deal.storeName} - DealHub`,
    description: `${deal.title}. Save ${deal.discount}% at ${deal.storeName} in ${deal.location.city}, ${deal.location.state}. Find the best deals near you!`,
    keywords: [
      deal.storeName.toLowerCase(),
      deal.category,
      'deals',
      'discounts',
      deal.location.city.toLowerCase(),
      deal.location.state.toLowerCase(),
      'coupons',
      'savings',
    ],
    type: 'product',
  };
}

export function generateCategorySEO(category: string): SEOData {
  const categoryNames: Record<string, string> = {
    restaurant: 'Restaurant Deals',
    grocery: 'Grocery Store Deals',
    gas: 'Gas Station Deals',
    coffee: 'Coffee Shop Deals',
  };

  return {
    title: `${categoryNames[category] || 'Deals'} - DealHub`,
    description: `Find the best ${category} deals and discounts near you. Save money on ${category} with DealHub's daily deals aggregator.`,
    keywords: [category, 'deals', 'discounts', 'coupons', 'savings'],
  };
}

// Generate structured data for deals (JSON-LD)
export function generateDealStructuredData(deal: {
  id: string;
  storeName: string;
  title: string;
  description: string;
  discount: number;
  originalPrice?: number;
  discountedPrice?: number;
  location: { address: string; city: string; state: string; zipCode: string };
  expiresAt: Date;
  image: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: deal.title,
    description: deal.description,
    price: deal.discountedPrice || 0,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: new Date().toISOString(),
    validThrough: deal.expiresAt.toISOString(),
    seller: {
      '@type': 'LocalBusiness',
      name: deal.storeName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: deal.location.address,
        addressLocality: deal.location.city,
        addressRegion: deal.location.state,
        postalCode: deal.location.zipCode,
        addressCountry: 'US',
      },
    },
    image: deal.image,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: deal.discountedPrice || 0,
      priceCurrency: 'USD',
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
      },
    },
  };
}

