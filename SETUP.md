# DealHub Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- (Optional) Google Maps API key if/when you re-enable the interactive map view

## Installation

1. **Install dependencies:**
   `ash
   npm install
   `

2. **Set up environment variables (optional for map view):**
   - Copy .env.example to .env.local
   - Uncomment and add your Google Maps API key only if you plan to bring the map online:
     `
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
     `
   - Get your API key from: https://console.cloud.google.com/google/maps-apis

3. **Run the development server:**
   `ash
   npm run dev
   `

4. **Open your browser:**
   - Navigate to http://localhost:3000

## Building for Production

`ash
npm run build
npm start
`

## Project Structure

`
dealhub/
 app/                    # Next.js app directory
    layout.tsx          # Root layout with SEO
    page.tsx            # Home page (card-first experience)
    globals.css         # Global styles
    sitemap.ts          # SEO sitemap
    robots.ts           # SEO robots.txt
    deals/[id]/         # Individual deal pages
 components/             # React components
    Header.tsx          # App header + status banner
    CategoryFilter.tsx  # Category filter buttons
    SortFilter.tsx      # Sort dropdown
    DealCard.tsx        # Individual deal card
    DealCardGrid.tsx    # Grid of deal cards
    DealCarousel.tsx    # Carousel for multiple deals
    DealBadge.tsx       # Badge component
    MapView.tsx         # Google Maps view (currently unused)
    DealDetailPage.tsx  # Full deal detail page
 data/                   # Mock data
    mockDeals.ts        # Sample deals
 lib/                    # Utilities
    monetization.ts     # Monetization hooks
    seo.ts              # SEO utilities
    utils.ts            # Helper functions
 types/                  # TypeScript types
    deal.ts             # Deal type definitions
 public/                 # Static assets
`

## Features

###  Implemented
- Card-first browsing (map view temporarily disabled)
- Category filtering (All, Restaurant, Grocery, Gas, Coffee)
- Sorting (Closest, Highest Discount, Trending)
- Photo-focused deal cards
- Multiple deals per store with carousel
- External app integration
- SEO optimization
- Monetization tracking hooks

###  Future Enhancements
- User authentication
- Favorites/saved deals
- Push notifications
- Business dashboard
- Analytics dashboard
- Interactive card  map view toggle

## Customization

### Adding New Categories
1. Update 	ypes/deal.ts - Add to DealCategory type
2. Update components/CategoryFilter.tsx - Add to categories array
3. Update mock data in data/mockDeals.ts

### Styling
- Colors are defined in 	ailwind.config.ts
- Primary color: Blue (Airbnb-inspired)
- Accent color: Red (for discounts)
- Customize in the 	heme.extend.colors section

### Adding Real Data
Replace mockDeals in pp/page.tsx with API calls:
`	ypescript
const response = await fetch('/api/deals');
const deals = await response.json();
`

## Troubleshooting

### Re-enabling the Map View
- Uncomment and populate NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Re-introduce the MapView component in pp/page.tsx when youre ready

### Images not loading
- Check image URLs in mock data
- Update 
ext.config.js to allow your image domains
- Use 
ext/image component for optimization

### Build errors
- Run 
pm install to ensure all dependencies are installed
- Check TypeScript errors: 
pm run lint
- Clear .next folder and rebuild

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (only if needed)
4. Deploy

### Other Platforms
- Follow Next.js deployment guides
- Ensure environment variables are set
- Build command: 
pm run build
- Start command: 
pm start

## Support

For issues or questions, check:
- README.md - General information
- FEATURES.md - Feature documentation
- MONETIZATION.md - Monetization strategy
