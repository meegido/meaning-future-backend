export function POST(request) {
  console.log(request.body)
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}
