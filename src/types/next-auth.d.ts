import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      district?: string | null;
      verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    district?: string | null;
    verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    district?: string | null;
    verified: boolean;
  }
}
