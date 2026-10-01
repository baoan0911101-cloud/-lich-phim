import { query } from '@/lib/db';

// GET: lấy danh sách phim
export async function GET() {
  try {
    const moviesResult = await query(
      'SELECT * FROM movies ORDER BY COALESCE(updated_at, created_at) DESC'
    );
    const seasonsResult = await query(
      'SELECT * FROM seasons ORDER BY movie_id, sort_order'
    );

    const seasonsByMovie = {};
    seasonsResult.rows.forEach((s) => {
      if (!seasonsByMovie[s.movie_id]) seasonsByMovie[s.movie_id] = [];
      seasonsByMovie[s.movie_id].push(s);
    });

    const movies = moviesResult.rows.map((m) => ({
      ...m,
      seasons: seasonsByMovie[m.id] || [],
    }));

    return Response.json({ movies });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST: thêm phim mới
export async function POST(request) {
  try {
    const body = await request.json();
    const { password, movie } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (!movie?.id || !movie?.title) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    await query(
      `INSERT INTO movies (id, title, title_goc, poster, season, tags, total_duration, overview, telegram_url, messenger_url, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        movie.id,
        movie.title,
        movie.title_goc || null,
        movie.poster || null,
        movie.season || null,
        movie.tags || [],
        movie.total_duration || null,
        movie.overview || null,
        movie.telegram_url || null,
        movie.messenger_url || null,
        JSON.stringify(movie.custom_links || []),
        'HÔM NAY',
      ]
    );

    if (movie.seasons?.length) {
      for (let i = 0; i < movie.seasons.length; i++) {
        const s = movie.seasons[i];
        await query(
          `INSERT INTO seasons (movie_id, name, duration, facebook, youtube, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            movie.id,
            s.name,
            s.duration || null,
            s.facebook || null,
            s.youtube || null,
            i,
          ]
        );
      }
    }

    return Response.json({ success: true, id: movie.id });
  } catch (err) {
    if (err.code === '23505') {
      return Response.json(
        { error: 'Phim đã tồn tại (trùng id)' },
        { status: 400 }
      );
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
