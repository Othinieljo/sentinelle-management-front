// Middleware simplifié pour éviter les erreurs côté serveur
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques (pas d'authentification requise)
  const publicRoutes = ['/login', '/api', '/_next', '/static', '/favicon.ico'];
  
  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Récupérer les informations d'authentification depuis les cookies
  const token = request.cookies.get('sentinelle_token')?.value;
  const userRole = request.cookies.get('sentinelle_user_role')?.value;
  const isAuthenticated = request.cookies.get('sentinelle_is_authenticated')?.value === 'true';

  // Si pas de token, rediriger vers login
  if (!token || !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (!pathname.includes('/login')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier les permissions pour les routes protégées
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/member', request.url));
  }

  if (pathname.startsWith('/member') && !userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};