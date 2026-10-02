import { query } from '@/lib/db';

// GET: lấy tất cả lịch chiếu
export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM schedule ORDER BY day, sort_order, id'
    );
    return Response.json({ schedule: result.rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST: thêm lịch chiếu mới
export async function POST(request) {
  try {
    const { password, item } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!item?.day || !item?.title) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    const maxOrder = await query(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM schedule WHERE day = $1',
      [item.day]
    );

    const sortOrder = (maxOrder.rows[0]?.max_order || 0) + 1;

    const result = await query(
      `INSERT INTO schedule (day, date, movie_id, title, poster, season, status, show_at, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        item.day,
        item.date || '',
        item.movie_id || null,
        item.title,
        item.poster || null,
        item.season || null,
        item.status || 'Sắp chiếu',
        item.show_at || null,
        sortOrder,
      ]
    );

    return Response.json({ success: true, item: result.rows[0] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: xoá tất cả (dùng cho admin reset)
export async function DELETE(request) {
  try {
    const { password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    await query('DELETE FROM schedule');
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
