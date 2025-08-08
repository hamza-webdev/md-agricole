import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Vérifier si l'utilisateur essaie d'accéder aux routes admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Vérifier si l'utilisateur a le rôle ADMIN
      if (req.nextauth.token?.role !== "ADMIN") {
        // Rediriger vers la page de connexion avec un message d'erreur
        const url = new URL("/auth/connexion", req.url);
        url.searchParams.set("error", "AccessDenied");
        url.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permettre l'accès aux routes publiques
        if (!req.nextUrl.pathname.startsWith("/admin")) {
          return true;
        }
        
        // Pour les routes admin, vérifier l'authentification et le rôle
        return !!token && token.role === "ADMIN";
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*"
  ]
};
