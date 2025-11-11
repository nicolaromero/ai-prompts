import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCurrentUserId } from '@/lib/auth-helpers';

/**
 * GET /api/prompts
 * Get all prompts for the current user
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: prompts, error } = await supabaseServer
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts
 * Create a new prompt
 */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'role', 'context', 'security', 'task', 'response_format'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: missingFields },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const promptData = {
      user_id: userId,
      name: body.name,
      role: body.role,
      context: body.context,
      security: body.security,
      task: body.task,
      guidelines: body.guidelines || null,
      examples: body.examples || null,
      language: body.language || null,
      language_enabled: body.language_enabled || false,
      response_format: body.response_format,
    };

    const { data: prompt, error } = await supabaseServer
      .from('prompts')
      .insert([promptData])
      .select()
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      return NextResponse.json(
        { error: 'Failed to create prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
