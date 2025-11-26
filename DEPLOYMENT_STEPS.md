# Quick Deployment Steps - 100% Free

## Prerequisites
- GitHub account (free)
- Email address

## Step 1: Set Up Supabase (15 min)

1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project: `dealhub`
4. Wait 2 minutes for setup
5. Go to SQL Editor → Run the SQL from `FREE_DEPLOYMENT_GUIDE.md`
6. Go to Storage → Create bucket `deal-images` (make it public)
7. Go to Settings → API → Copy:
   - Project URL
   - `anon` key
   - `service_role` key (keep secret!)

## Step 2: Update Environment Variables (5 min)

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ADMIN_PASSWORD=your_secure_password_here
   ```

## Step 3: Test Locally (5 min)

```bash
npm run dev
```

Visit:
- http://localhost:3002 - Main app
- http://localhost:3002/admin - Admin panel (use your password)

## Step 4: Push to GitHub (5 min)

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dealhub.git
git push -u origin main
```

## Step 5: Deploy to Vercel (10 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `dealhub` repository
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your app is live! 🎉

## Step 6: Test Production

1. Visit your Vercel URL: `https://dealhub.vercel.app`
2. Test creating a deal at `/admin`
3. Verify it shows on the main page

## That's It!

Your app is now live and 100% free!

### Next Steps (Optional):
- Add custom domain (see FREE_DEPLOYMENT_GUIDE.md)
- Set up analytics
- Add error tracking


