import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { password, id, movie } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!id || !movie) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // Kiểm tra phim tồn tại
    const exist = await query('SELECT id FROM movies WHERE id = $1', [id]);
    if (exist.rows.length === 0) {
      return Response.json({ error: 'Phim không tồn tại' }, { status: 404 });
    }

    // Update bảng movies
    await query(
      `UPDATE movies SET
        title = $1,
        title_goc = $2,
        poster = $3,
        tags = $4,
        total_duration = $5,
        overview = $6,
        telegram_url = $7,
        messenger_url = $8,
        updated_at = NOW()
       WHERE id = $9`,
      [
        movie.title,
        movie.title_goc || null,
        movie.poster || null,
        movie.tags || [],
        movie.total_duration || null,
        movie.overview || null,
        movie.telegram_url || null,
        movie.messenger_url || null,
        id,
      ]
    );

    // Xoá seasons cũ
    await query('DELETE FROM seasons WHERE movie_id = $1', [id]);

    // Insert seasons mới
    if (movie.seasons?.length) {
      for (let i = 0; i < movie.seasons.length; i++) {
        const s = movie.seasons[i];
        await query(
          `INSERT INTO seasons (movie_id, name, duration, facebook, youtube, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            s.name,
            s.duration || null,
            s.facebook || null,
            s.youtube || null,
            i,
          ]
        );
      }
    }

    return Response.json({ success: true, id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
