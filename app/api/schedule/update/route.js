import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { password, id, item, seasons, custom_links } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!id || !item) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    const exist = await query('SELECT id FROM schedule WHERE id = $1', [id]);
    if (exist.rows.length === 0) {
      return Response.json({ error: 'Lịch không tồn tại' }, { status: 404 });
    }

    // Xử lý timezone
    let showAtValue = null;
    if (item.show_at) {
      showAtValue = item.show_at.replace('T', ' ');
      if (showAtValue.length === 16) {
        showAtValue += ':00';
      }
    }

    // UPDATE LỊCH
    await query(
      `UPDATE schedule SET
        day = $1, date = $2, movie_id = $3, title = $4, poster = $5,
        season = $6, status = $7, show_at = $8
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

    // NẾU CÓ movie_id → UPDATE PHIM
    if (item.movie_id) {
      const existingMovie = await query(
        'SELECT id FROM movies WHERE id = $1',
        [item.movie_id]
      );

      if (existingMovie.rows.length > 0) {
        await query(
          `UPDATE movies SET
            title = $1, title_goc = $2, poster = $3, season = $4,
            tags = $5, total_duration = $6, overview = $7,
            custom_links = $8, updated_at = NOW()
           WHERE id = $9`,
          [
            item.title,
            item.title_goc || null,
            item.poster || null,
            item.season || null,
            item.tags
              ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
            item.duration || null,
            item.overview || null,
            JSON.stringify(custom_links || []),
            item.movie_id,
          ]
        );

        // Xoá seasons cũ + thêm lại
        if (seasons?.length) {
          await query('DELETE FROM seasons WHERE movie_id = $1', [item.movie_id]);

          for (let i = 0; i < seasons.length; i++) {
            const s = seasons[i];
            await query(
              `INSERT INTO seasons (movie_id, name, duration, facebook, youtube, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                item.movie_id,
                s.name || `Phần ${i + 1}`,
                s.duration || null,
                s.facebook || null,
                s.youtube || null,
                i,
              ]
            );
          }
        }
      }
    }

    return Response.json({ success: true, id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
