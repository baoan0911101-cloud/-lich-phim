import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Xoá những user không hoạt động quá 2 phút
    await query("DELETE FROM online_users WHERE last_seen < NOW() - INTERVAL '2 minutes'");

    // Đếm số user đang online
    const result = await query('SELECT COUNT(*) as count FROM online_users');
    const count = parseInt(result.rows[0].count) || 1;

    return Response.json({ online: count });
  } catch (err) {
    return Response.json({ online: 1 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    // Cập nhật hoặc thêm user mới
    await query(`
      INSERT INTO online_users (id, last_seen) 
      VALUES ($1, NOW())
      ON CONFLICT (id) DO UPDATE SET last_seen = NOW()
    `, [userId]);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
