import { query } from '@/lib/db';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
});

// Lấy lịch sử chat (50 tin nhắn gần nhất)
export async function GET() {
  try {
    const res = await query(`
      SELECT m.id, m.content, m.created_at, u.id as user_id, u.name, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at ASC LIMIT 50
    `);
    return Response.json({ messages: res.rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Gửi tin nhắn
export async function POST(request) {
  try {
    const { userId, content } = await request.json();
    if (!userId || !content?.trim()) return Response.json({ error: 'Lỗi' }, { status: 400 });

    // Lưu vào DB
    const res = await query(
      `INSERT INTO messages (user_id, content) VALUES ($1, $2) RETURNING id, created_at`,
      [userId, content]
    );

    const userRes = await query('SELECT name, avatar FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    const newMessage = {
      id: res.rows[0].id,
      content,
      created_at: res.rows[0].created_at,
      user_id: userId,
      name: user?.name || 'Ẩn danh',
      avatar: user?.avatar || '👤'
    };

    // Bắn realtime qua Pusher
    await pusher.trigger('chat-global', 'new-message', newMessage);

    return Response.json({ success: true, message: newMessage });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
