export function POST(request) {
  console.log(request)
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}
