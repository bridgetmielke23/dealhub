# Deployment Guide

## Quick Start Checklist

### ✅ What's Already Done
- ✅ API routes for deals (GET, POST, PUT, DELETE)
- ✅ Admin interface at `/admin`
- ✅ Location detection and filtering
- ✅ Distance calculation
- ✅ User location on map

### 🔄 Next Steps to Go Live

## 1. Choose a Database

### Option A: Supabase (Recommended - Easiest)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Run this SQL in the SQL Editor:

```sql
-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  store_logo TEXT,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'grocery', 'gas', 'coffee')),
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  discount INTEGER NOT NULL,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  location JSONB NOT NULL,
  badge TEXT CHECK (badge IN ('great-deal', 'ends-soon', 'trending', 'new')),
  expires_at TIMESTAMP NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  partner_app_url TEXT,
  partner_app_name TEXT,
  deals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for location queries
CREATE INDEX idx_deals_location ON deals USING GIST (
  point((location->>'lng')::float, (location->>'lat')::float)
);

-- Create index for category
CREATE INDEX idx_deals_category ON deals(category);

-- Enable Row Level Security (optional, for admin access)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
```

4. Get your connection string from Project Settings > Database
5. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

### Option B: MongoDB Atlas
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Install MongoDB driver:
```bash
npm install mongodb
```

### Option C: PlanetScale (MySQL)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create database
3. Install Prisma or use MySQL driver:
```bash
npm install @planetscale/database
```

## 2. Update API Routes to Use Database

Replace the mock data in `/app/api/deals/route.ts` with actual database queries.

Example for Supabase:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In GET handler:
const { data, error } = await supabase
  .from('deals')
  .select('*')
  .eq('category', category);
```

## 3. Set Up Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL=your_connection_string
# or for Supabase:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Image Upload Service
CLOUDINARY_URL=your_cloudinary_url
# or
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

## 4. Add Authentication (For Admin)

### Option A: NextAuth.js
```bash
npm install next-auth
```

Create `/app/api/auth/[...nextauth]/route.ts` and protect admin routes.

### Option B: Supabase Auth
Already included if using Supabase - just add auth checks to admin routes.

## 5. Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up HTTPS
- Provide a custom domain
- Handle deployments on every push

### Alternative: Netlify
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `.next`

## 6. Set Up Custom Domain

1. In Vercel/Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## 7. Image Upload Setup

### Option A: Cloudinary (Recommended)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name and API keys
3. Install:
```bash
npm install cloudinary
```
4. Create API route: `/app/api/upload/route.ts`

### Option B: Supabase Storage
If using Supabase, use their storage buckets for images.

## 8. Production Checklist

- [ ] Database connected and working
- [ ] Environment variables set in production
- [ ] Admin authentication enabled
- [ ] Image upload working
- [ ] Error tracking set up (Sentry)
- [ ] Analytics added (Google Analytics or Plausible)
- [ ] SEO meta tags optimized
- [ ] Performance tested
- [ ] Mobile responsive tested
- [ ] HTTPS enabled
- [ ] Custom domain configured

## 9. Monitoring & Analytics

### Error Tracking
```bash
npm install @sentry/nextjs
```

### Analytics
- Google Analytics
- Plausible Analytics
- Vercel Analytics (built-in)

## 10. Next Features to Add

1. **Search functionality** - Add search bar to filter deals
2. **Category filters** - Filter buttons for restaurant/grocery/etc
3. **User accounts** - Let users save favorite deals
4. **Notifications** - Email/push notifications for new deals
5. **Deal expiration** - Auto-hide expired deals
6. **Analytics dashboard** - Track which deals are popular
7. **Bulk import** - CSV upload for multiple deals

## Support & Resources

- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Leaflet Docs: https://leafletjs.com

## Estimated Costs (Monthly)

- **Vercel**: Free tier (hobby) or $20/month (pro)
- **Supabase**: Free tier or $25/month (pro)
- **Domain**: $10-15/year
- **Cloudinary**: Free tier or $89/month (plus)
- **Total**: ~$0-50/month for small scale

---

**Ready to deploy?** Start with Supabase + Vercel for the fastest path to production!


