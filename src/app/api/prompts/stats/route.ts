import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCurrentUserId, getActiveOrganizationId } from '@/lib/auth-helpers';

/**
 * GET /api/prompts/stats
 * Get statistics about organization's prompts
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const organizationId = await getActiveOrganizationId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No active organization' },
        { status: 400 }
      );
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabaseServer
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (totalError) {
      console.error('Error counting total prompts:', totalError);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Get count for this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count: monthCount, error: monthError } = await supabaseServer
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', firstDayOfMonth.toISOString());

    if (monthError) {
      console.error('Error counting month prompts:', monthError);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      total: totalCount || 0,
      thisMonth: monthCount || 0,
      bestPractices: 100, // Always 100% as we enforce best practices
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
