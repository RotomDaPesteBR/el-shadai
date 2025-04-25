export async function POST(request: Request) {
  const payload = await request.json();

  const { email, password } = payload;

  //console.log(email);
  //console.log(password);

  if (email === 'a@b.com' && password === '123') {
    return Response.json('OK');
  } else {
    return new Response('Invalid credentials', {
      status: 401
    });
  }
}
