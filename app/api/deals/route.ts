import { NextRequest, NextResponse } from 'next/server';
import { getDeals } from '@/lib/supabase';

/**
 * GET /api/deals
 * Fetch deals with optional location-based filtering
 * 
 * Query parameters:
 * - lat: User latitude
 * - lng: User longitude
 * - maxDistance: Maximum distance in km (default: 50)
 * - category: Filter by category
 * - sort: Sort by 'closest', 'highest-discount', or 'trending'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const maxDistance = searchParams.get('maxDistance') || '50';
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'closest';

    // Use Supabase to fetch deals
    const deals = await getDeals({
      category: category || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      sort: sort || undefined,
    });

    return NextResponse.json({
      success: true,
      data: deals,
      count: deals.length,
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    // Fallback to mock data if Supabase not configured
    const { mockDeals } = await import('@/data/mockDeals');
    return NextResponse.json({
      success: true,
      data: mockDeals,
      count: mockDeals.length,
      warning: 'Using mock data - Supabase not configured',
    });
  }
}

/**
 * POST /api/deals
 * Create a new deal (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Simple password authentication
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'storeName',
      'category',
      'title',
      'image',
      'discount',
      'location',
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Use Supabase to create deal
    const { createDeal } = await import('@/lib/supabase');
    const newDeal = await createDeal({
      storeName: body.storeName,
      category: body.category,
      title: body.title,
      description: body.description || '',
      image: body.image,
      discount: body.discount,
      originalPrice: body.originalPrice,
      discountedPrice: body.discountedPrice,
      location: body.location,
      badge: body.badge,
      expiresAt: new Date(body.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000),
      views: 0,
      clicks: 0,
      partnerAppUrl: body.partnerAppUrl,
      partnerAppName: body.partnerAppName,
      deals: body.deals || [],
    });

    if (!newDeal) {
      return NextResponse.json(
        { success: false, error: 'Failed to create deal in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newDeal,
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

