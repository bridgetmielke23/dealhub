# 100% Free Deployment Guide for DealHub

## Complete Free Stack Overview

### ✅ What We'll Use (All Free Tiers)

1. **Hosting**: Vercel (Free Forever)
2. **Database**: Supabase (Free Tier - 500MB, 2 projects)
3. **Image Storage**: Supabase Storage (Free - 1GB)
4. **Domain**: Vercel Subdomain (Free) OR Freenom (.tk/.ml/.ga - Free)
5. **Email**: Resend (Free - 3,000 emails/month) OR Gmail SMTP (Free)
6. **Analytics**: Vercel Analytics (Free) OR Plausible (Free trial)
7. **Error Tracking**: Sentry (Free - 5,000 events/month)

**Total Cost: $0/month** 🎉

---

## Step-by-Step Deployment

### Phase 1: Database Setup (Supabase) - 15 minutes

#### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (free)
4. Create a new organization
5. Create a new project:
   - Name: `dealhub`
   - Database Password: (save this!)
   - Region: Choose closest to you
   - Wait 2 minutes for setup

#### 1.2 Set Up Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Run this SQL:

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

-- Create indexes for performance
CREATE INDEX idx_deals_category ON deals(category);
CREATE INDEX idx_deals_expires_at ON deals(expires_at);
CREATE INDEX idx_deals_location ON deals USING GIN (location);

-- Enable Row Level Security (optional for now)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all reads (public access)
CREATE POLICY "Allow public read access" ON deals
  FOR SELECT USING (true);

-- Create policy for admin writes (we'll add auth later)
-- For now, we'll handle auth in API routes
CREATE POLICY "Allow authenticated inserts" ON deals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated updates" ON deals
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated deletes" ON deals
  FOR DELETE USING (true);
```

#### 1.3 Set Up Storage Bucket
1. Go to Storage in Supabase dashboard
2. Create new bucket: `deal-images`
3. Make it public (for public access)
4. Set up CORS if needed

#### 1.4 Get API Keys
1. Go to Project Settings > API
2. Copy:
   - Project URL
   - `anon` public key (for client-side)
   - `service_role` key (for server-side - keep secret!)

---

### Phase 2: Update Code for Supabase - 30 minutes

#### 2.1 Install Dependencies
```bash
npm install @supabase/supabase-js
```

#### 2.2 Create Supabase Client
Create `lib/supabase.ts` (we'll do this)

#### 2.3 Update API Routes
Update `/app/api/deals/route.ts` to use Supabase (we'll do this)

#### 2.4 Add Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### Phase 3: Deploy to Vercel - 10 minutes

#### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dealhub.git
git push -u origin main
```

#### 3.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click "Add New Project"
4. Import your `dealhub` repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your app is live! 🎉

#### 3.3 Get Your Free Domain
- Vercel gives you: `dealhub.vercel.app` (free forever)
- Or use custom domain (see Phase 4)

---

### Phase 4: Custom Domain (Optional - Still Free Options)

#### Option A: Free Subdomain
- Use Vercel's free subdomain: `yourname.vercel.app`

#### Option B: Freenom (Free TLD)
1. Go to [freenom.com](https://freenom.com)
2. Search for available domain (.tk, .ml, .ga, .cf, .gq)
3. Register for free (1 year, renewable)
4. Point DNS to Vercel:
   - Add CNAME: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP (get from Vercel dashboard)

#### Option C: Namecheap/GoDaddy ($1-2/year)
- Cheapest paid option if you want .com

---

### Phase 5: Add Authentication (Optional - Free)

#### Option A: Simple Password Protection (Easiest)
- Add a simple password check for admin routes
- No external service needed

#### Option B: NextAuth.js with Supabase (Free)
```bash
npm install next-auth @auth/supabase-adapter
```
- Uses Supabase for auth (free tier)

#### Option C: Clerk (Free Tier)
- 10,000 MAU free
- Easy setup

---

### Phase 6: Image Upload (Free with Supabase)

1. Update admin form to upload images
2. Use Supabase Storage (1GB free)
3. Get public URLs for images

---

## Complete Implementation Checklist

### Database & Backend
- [ ] Set up Supabase account
- [ ] Create database schema
- [ ] Set up storage bucket
- [ ] Install Supabase client
- [ ] Update API routes to use Supabase
- [ ] Test CRUD operations

### Frontend
- [ ] Update admin form for image upload
- [ ] Add loading states
- [ ] Test location search
- [ ] Test bulk deal creation

### Deployment
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Test production build
- [ ] Set up custom domain (optional)

### Security
- [ ] Add admin authentication
- [ ] Secure API routes
- [ ] Add rate limiting (Vercel has built-in)

### Monitoring (All Free)
- [ ] Set up Vercel Analytics
- [ ] Add Sentry for error tracking
- [ ] Monitor Supabase usage

---

## Free Tier Limits & What to Watch

### Supabase Free Tier
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**When to upgrade**: If you exceed 500MB database or 1GB storage

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

**When to upgrade**: If you exceed 100GB bandwidth (unlikely for starting)

---

## Cost Breakdown

| Service | Free Tier | Upgrade Needed When |
|---------|-----------|---------------------|
| Vercel | Forever | >100GB bandwidth/month |
| Supabase | Forever | >500MB DB or >1GB storage |
| Domain | Free subdomain | Want .com domain ($12/year) |
| **Total** | **$0/month** | **$0-12/year** |

---

## Next Steps After Deployment

1. **Test Everything**
   - Create a test deal
   - Search for locations
   - View on map
   - Test user location

2. **Add Analytics**
   - Vercel Analytics (built-in)
   - Google Analytics (free)

3. **SEO Optimization**
   - Add meta tags
   - Sitemap
   - robots.txt

4. **Performance**
   - Image optimization
   - Caching strategies

5. **Marketing**
   - Share on social media
   - Submit to directories
   - Get user feedback

---

## Troubleshooting

### Database Connection Issues
- Check environment variables in Vercel
- Verify Supabase project is active
- Check RLS policies

### Image Upload Fails
- Verify storage bucket is public
- Check CORS settings
- Verify file size limits

### Build Errors
- Check Next.js version compatibility
- Verify all dependencies installed
- Check TypeScript errors

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Community**: Discord, GitHub Discussions

---

**Ready to deploy?** Let's start implementing the Supabase integration!


