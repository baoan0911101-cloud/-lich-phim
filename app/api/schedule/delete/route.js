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

    // 🎯 Lấy movie_id của lịch chiếu
    const scheduleResult = await query(
      'SELECT movie_id FROM schedule WHERE id = $1',
      [id]
    );

    if (scheduleResult.rows.length === 0) {
      return Response.json({ error: 'Lịch không tồn tại' }, { status: 404 });
    }

    const movieId = scheduleResult.rows[0].movie_id;

    // Xoá lịch chiếu
    await query('DELETE FROM schedule WHERE id = $1', [id]);

    // 🎯 Nếu có phim liên kết → xoá luôn
    if (movieId) {
      await query('DELETE FROM seasons WHERE movie_id = $1', [movieId]);
      await query('DELETE FROM schedule WHERE movie_id = $1', [movieId]);
      await query('DELETE FROM movies WHERE id = $1', [movieId]);
    }

    return Response.json({
      success: true,
      deletedMovie: !!movieId,
      movieId: movieId || null,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
