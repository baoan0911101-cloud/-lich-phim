import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { password, id, item } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!id || !item) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // Kiểm tra lịch tồn tại
    const exist = await query('SELECT id FROM schedule WHERE id = $1', [id]);
    if (exist.rows.length === 0) {
      return Response.json({ error: 'Lịch không tồn tại' }, { status: 404 });
    }

    // 🎯 Xử lý timezone cho show_at
    let showAtValue = null;
    if (item.show_at) {
      showAtValue = item.show_at.replace('T', ' ');
      if (showAtValue.length === 16) {
        showAtValue += ':00';
      }
    }

    // Update lịch
    await query(
      `UPDATE schedule SET
        day = $1,
        date = $2,
        movie_id = $3,
        title = $4,
        poster = $5,
        season = $6,
        status = $7,
        show_at = $8
       WHERE id = $9`,
      [
        item.day,
        item.date || '',
        item.movie_id || null,
        item.title,
        item.poster || null,
        item.season || null,
        item.status || 'Sắp chiếu',
        showAtValue,
        id,
      ]
    );

    return Response.json({ success: true, id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
