import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;
        if (!token) return false;

        if (pathname.startsWith("/admin")) {
          return token.role === "ADMIN";
        }

        if (pathname.startsWith("/api/ngo")) {
          return token.role === "NGO" || token.role === "ADMIN";
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/ngo/:path*"],
};
