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

const ALLOWED_SOURCES = ['shortcut', 'mobile', 'manual', 'share_extension', 'agent', 'iphone-dictation', 'mac-dictation'];

export async function POST(request: NextRequest) {
  try {
    // Check auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CAPTURE_TOKEN || token !== CAPTURE_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get content from body
    const body = await request.json();
    const { content, source = 'shortcut' } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Input length limit
    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    // Validate source against allow-list
    if (!ALLOWED_SOURCES.includes(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    // Detect if it's a URL
    const isUrl = /^https?:\/\//.test(content.trim());

    // Insert into Supabase
    const { data, error } = await supabase
      .from('fleeting_thoughts')
      .insert({
        content: content.trim(),
        user_id: USER_ID,
        content_type: isUrl ? 'link' : 'text',
        source: source,
        status: 'inbox',
        url: isUrl ? content.trim() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to capture thought', debug: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Captured!'
    });

  } catch (err) {
    console.error('Capture error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
