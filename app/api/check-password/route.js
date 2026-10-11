export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return Response.json({ ok: true });
    }

    return Response.json(
      { ok: false, error: 'Sai email hoặc mật khẩu' },
      { status: 401 }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
