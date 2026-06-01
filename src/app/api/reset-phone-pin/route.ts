import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const email = `tel_${phone}@samafacture.app`;

  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const user = users.find(u => u.email === email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
