import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCurrentUserId, getActiveOrganizationId } from '@/lib/auth-helpers';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/prompts/[id]
 * Get a single prompt by ID
 */
export async function GET(request: Request, context: RouteContext) {
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

    const { id } = await context.params;

    const { data: prompt, error } = await supabaseServer
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching prompt:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prompts/[id]
 * Update a prompt (full update)
 */
export async function PUT(request: Request, context: RouteContext) {
  return PATCH(request, context);
}

/**
 * PATCH /api/prompts/[id]
 * Update a prompt (partial update)
 */
export async function PATCH(request: Request, context: RouteContext) {
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

    const { id } = await context.params;
    const body = await request.json();

    // Remove fields that shouldn't be updated
    const { id: _, organization_id: __, created_by: ___, created_at: ____, ...updates } = body;

    const { data: prompt, error } = await supabaseServer
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        );
      }
      console.error('Error updating prompt:', error);
      return NextResponse.json(
        { error: 'Failed to update prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id]
 * Delete a prompt
 */
export async function DELETE(request: Request, context: RouteContext) {
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

    const { id } = await context.params;

    const { error } = await supabaseServer
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error deleting prompt:', error);
      return NextResponse.json(
        { error: 'Failed to delete prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
