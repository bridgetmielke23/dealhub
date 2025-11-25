# DealHub - Free Deal Discovery Platform

A 100% free, location-based deal discovery platform built with Next.js, Leaflet, and Supabase.

## Features

- 🗺️ **Interactive Map** - View deals on an interactive map
- 📍 **Location-Based** - Find deals near you using your location
- 🏪 **Store Search** - Automatically find all locations of any store chain
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔐 **Admin Panel** - Easy deal management interface
- 💰 **100% Free** - Built entirely on free tier services

## Tech Stack (All Free)

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Maps**: Leaflet, React-Leaflet
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **Location Services**: OpenStreetMap (Nominatim & Overpass API)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/dealhub.git
cd dealhub
npm install
```

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL from `FREE_DEPLOYMENT_GUIDE.md` in SQL Editor
4. Create storage bucket `deal-images` (make public)

### 3. Configure Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_secure_password
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3002

## Deployment

See `DEPLOYMENT_STEPS.md` for step-by-step deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Project Structure

```
dealhub/
├── app/
│   ├── admin/          # Admin panel
│   ├── api/            # API routes
│   └── page.tsx        # Main page
├── components/         # React components
├── lib/                # Utilities
│   ├── supabase.ts    # Database client
│   ├── location.ts    # Location utilities
│   ├── geocoding.ts   # Geocoding services
│   └── overpass.ts    # Store location search
└── types/              # TypeScript types
```

## Features in Detail

### Store Location Search
- **Local Search**: Find nearby locations using Nominatim
- **Nationwide Search**: Find ALL locations of a chain using Overpass API
- **Bulk Creation**: Create deals for multiple locations at once

### Admin Panel
- Add/edit/delete deals
- Search for store locations automatically
- Create deals for entire store chains nationwide
- Simple password authentication

### User Features
- Interactive map with deal markers
- Location-based filtering
- Distance calculation
- Collapsible deals list
- Responsive design

## Free Tier Limits

- **Supabase**: 500MB database, 1GB storage, 50K MAU
- **Vercel**: Unlimited deployments, 100GB bandwidth
- **OpenStreetMap**: No limits (be respectful of rate limits)

## Contributing

Contributions welcome! Please open an issue or pull request.

## License

MIT License - feel free to use for your own projects!

## Support

- Documentation: See `FREE_DEPLOYMENT_GUIDE.md`
- Issues: GitHub Issues
- Questions: Open a discussion

---

Built with ❤️ using 100% free services
