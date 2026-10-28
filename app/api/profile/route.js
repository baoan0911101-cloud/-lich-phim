import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { id, name, avatar } = await request.json();
    await query(`
      INSERT INTO users (id, name, avatar) VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET name = $2, avatar = $3
    `, [id, name, avatar]);
    
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
