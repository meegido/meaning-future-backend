export function GET(request) {
  console.log(request)
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}