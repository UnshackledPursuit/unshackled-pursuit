import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service key for server-side insert
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.SUPABASE_SERVICE_KEY!.trim()
);

// Simple token auth for shortcuts
const CAPTURE_TOKEN = process.env.CAPTURE_TOKEN?.trim();

// Your user ID (from Supabase)
const USER_ID = '18a92969-5664-4d63-95fc-d8481e6c42e2';

const ALLOWED_SOURCES = ['shortcut', 'mobile', 'manual', 'share_extension', 'agent', 'iphone-dictation', 'mac-dictation', 'intelligence-feed', 'user-action', 'health-insight', 'agent-activity', 'metrics-feed', 'media-feed', 'media-review', 'dashboard-review', 'agent-review', 'board-review', 'chrome-extraction'];

const ALLOWED_ORIGINS = ['https://fleetingthoughts.app', 'https://www.unshackledpursuit.com', 'https://unshackledpursuit.com'];

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    // Check auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CAPTURE_TOKEN || token !== CAPTURE_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    // Get content from body
    const body = await request.json();
    const { content, source = 'shortcut', tags, metadata } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400, headers });
    }

    // Input length limit
    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400, headers });
    }

    // Validate source against allow-list
    if (!ALLOWED_SOURCES.includes(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400, headers });
    }

    // Detect if it's a URL
    const isUrl = /^https?:\/\//.test(content.trim());

    // Build insert payload
    const insertPayload: Record<string, unknown> = {
      content: content.trim(),
      user_id: USER_ID,
      content_type: isUrl ? 'link' : 'text',
      source: source,
      status: 'inbox',
      url: isUrl ? content.trim() : null,
    };

    // Pass through tags if provided
    if (Array.isArray(tags) && tags.length > 0) {
      insertPayload.tags = tags;
    }

    // Pass through metadata if provided
    if (metadata && typeof metadata === 'object') {
      insertPayload.metadata = metadata;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('fleeting_thoughts')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to capture thought' }, { status: 500, headers });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Captured!'
    }, { headers });

  } catch (err) {
    console.error('Capture error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers });
  }
}
