export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password === process.env.ADMIN_PASSWORD) {
      return Response.json({ ok: true });
    }

    return Response.json(
      { ok: false, error: 'Sai mật khẩu' },
      { status: 401 }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
