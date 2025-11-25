import { NextRequest, NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/lib/supabase';

/**
 * GET /api/deals/[id]
 * Get a single deal by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await getDealById(params.id);

    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deal,
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/deals/[id]
 * Update a deal (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updatedDeal = await updateDeal(params.id, body);

    if (!updatedDeal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDeal,
      message: 'Deal updated successfully',
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deals/[id]
 * Delete a deal (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const success = await deleteDeal(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Deal not found or delete failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}

