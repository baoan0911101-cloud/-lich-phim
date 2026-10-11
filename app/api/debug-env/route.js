export async function GET() {
  return Response.json({
    hasEmail: !!process.env.ADMIN_EMAIL,
    emailValue: process.env.ADMIN_EMAIL || '(chưa set)',
    hasPassword: !!process.env.ADMIN_PASSWORD,
    passwordLength: process.env.ADMIN_PASSWORD?.length || 0,
  });
}
