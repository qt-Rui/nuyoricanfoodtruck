// middleware.js
import { auth } from "./auth";

export default auth((req) => {
  // Optional: Add public routes that don't require auth
  const publicPaths = ['/api/auth/', '/auth/signin', '/'];
  
  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return;
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  runtime: 'nodejs', // Force Node.js runtime
};