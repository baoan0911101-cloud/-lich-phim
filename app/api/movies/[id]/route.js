import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const movieResult = await query('SELECT * FROM movies WHERE id = $1', [id]);
    if (movieResult.rows.length === 0) {
      return Response.json({ error: 'Không tìm thấy phim' }, { status: 404 });
    }

    const movie = movieResult.rows[0];

    const seasonsResult = await query(
      'SELECT * FROM seasons WHERE movie_id = $1 ORDER BY sort_order',
      [id]
    );

    return Response.json({
      movie: { ...movie, seasons: seasonsResult.rows },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
