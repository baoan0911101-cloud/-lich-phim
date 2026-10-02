import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { password, id } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!id) {
      return Response.json({ error: 'Thiếu id' }, { status: 400 });
    }

    await query('DELETE FROM schedule WHERE id = $1', [id]);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
