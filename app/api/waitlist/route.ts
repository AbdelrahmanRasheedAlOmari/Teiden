import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email } = body;

    // Simple validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Check if email already exists in waitlist table
    const { data: existingEmail } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { success: true, message: 'You are already on the waitlist' },
        { status: 200 }
      );
    }

    // Add email to waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email }]);

    if (error) {
      console.error('Error adding to waitlist:', error);
      throw new Error('Failed to add to waitlist');
    }
    
    console.log(`Added email to waitlist: ${email}`);

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Successfully added to the waitlist' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
} 