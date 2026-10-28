import { query } from '@/lib/db';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
  useTLS: true
});

export async function GET() {
  try {
    const res = await query(`
      SELECT m.id, m.content, m.created_at, m.reply_to_name, m.reply_to_content, u.id as user_id, u.name, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at ASC LIMIT 50
    `);
    return Response.json({ messages: res.rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, content, replyToName, replyToContent } = await request.json();
    if (!userId || !content?.trim()) return Response.json({ error: 'Dữ liệu trống' }, { status: 400 });

    // Tạo user nếu chưa có
    const checkUser = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (checkUser.rows.length === 0) {
      await query(
        'INSERT INTO users (id, name, avatar) VALUES ($1, $2, $3)',
        [userId, 'No Name #' + userId.slice(-4), '👤']
      );
    }

    // Lưu tin nhắn kèm thông tin trả lời (nếu có)
    const res = await query(
      `INSERT INTO messages (user_id, content, reply_to_name, reply_to_content) 
       VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [userId, content, replyToName || null, replyToContent || null]
    );

    const userRes = await query('SELECT name, avatar FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    const newMessage = {
      id: res.rows[0].id,
      content,
      reply_to_name: replyToName || null,
      reply_to_content: replyToContent || null,
      created_at: res.rows[0].created_at,
      user_id: userId,
      name: user?.name || 'Ẩn danh',
      avatar: user?.avatar || '👤'
    };

    await pusher.trigger('chat-global', 'new-message', newMessage);

    return Response.json({ success: true, message: newMessage });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
