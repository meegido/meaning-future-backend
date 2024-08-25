export function GET(request) {
  console.log(request)
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}

https://eda67a9e-72e0-4942-b829-6ac7cbee90ab-00-3cq7fz51w6llw.kirk.replit.dev/slack/events