export async function POST(request) {
  const body = await request.body
  console.log(body)
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}
