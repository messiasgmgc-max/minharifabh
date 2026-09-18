import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `rifas/${Date.now()}_${safeName}`;
    const supabase = await getSupabaseClient();

    // Upload attempt to 'raffles' bucket
    const { data, error } = await supabase.storage
      .from('raffles')
      .upload(filename, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload warning:', error.message);
      // Attempt bucket creation if not existing
      if (error.message.includes('not found') || (error as any).statusCode === '404') {
        await supabase.storage.createBucket('raffles', { public: true });
        const retry = await supabase.storage.from('raffles').upload(filename, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });
        if (retry.error) throw retry.error;
      } else {
        throw error;
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from('raffles')
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error('API Upload Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar o upload da imagem.' },
      { status: 500 }
    );
  }
}
