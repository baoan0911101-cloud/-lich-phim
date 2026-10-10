import { query } from '@/lib/db';

export async function GET() {
  try {
    // Xoá lịch đã qua show_at
    await query(
      `DELETE FROM schedule 
       WHERE show_at IS NOT NULL 
         AND show_at <= NOW()`
    );

    // Xoá lịch "HÔM NAY" từ hôm qua
    await query(
      `DELETE FROM schedule 
       WHERE day = 'HÔM NAY'
         AND DATE(created_at) < CURRENT_DATE`
    );

    // Xoá lịch "NGÀY MAI" đã qua
    await query(
      `DELETE FROM schedule 
       WHERE day = 'NGÀY MAI'
         AND DATE(created_at) < CURRENT_DATE - INTERVAL '1 day'`
    );

    const result = await query(
      'SELECT * FROM schedule ORDER BY day, sort_order, id'
    );
    return Response.json({ schedule: result.rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { password, item, seasons } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!item?.day || !item?.title) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // 🎯 TÍNH sort_order MỚI
    const maxOrder = await query(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM schedule WHERE day = $1',
      [item.day]
    );

    const sortOrder = (maxOrder.rows[0]?.max_order || 0) + 1;

    // 🎯 NẾU CÓ movie_id VÀ CHƯA CÓ PHIM → TẠO PHIM MỚI + TẬP
    if (item.movie_id) {
      const existMovie = await query(
        'SELECT id FROM movies WHERE id = $1',
        [item.movie_id]
      );

      if (existMovie.rows.length === 0) {
        // Tạo phim mới
        await query(
          `INSERT INTO movies (id, title, title_goc, poster, season, tags, total_duration, overview, custom_links, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            item.movie_id,
            item.title,
            item.title_goc || null,
            item.poster || null,
            item.season || null,
            item.tags || [],
            item.total_duration || null,
            item.overview || null,
            JSON.stringify(item.custom_links || []),
            'HÔM NAY',
          ]
        );

        // 🎯 LƯU TẬP PHIM (seasons)
        if (seasons?.length) {
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

    // 🎯 INSERT LỊCH CHIẾU
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
