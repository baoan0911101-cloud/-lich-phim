import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: 'Thiếu ID' }, { status: 400 });

    // Tăng 1 lượt tim
    const result = await query(
      'UPDATE movies SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes',
      [id]
    );

    if (result.rows.length === 0) return Response.json({ error: 'Không tìm thấy phim' }, { status: 404 });

    return Response.json({ success: true, likes: result.rows[0].likes });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
