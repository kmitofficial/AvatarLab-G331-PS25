import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { parse } from "cookie";

const protectedRoutes = ['/workspace', '/videos', '/trash', '/feedback', '/help&support'];

export async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  if (!protectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const cookies = parse(req.headers.get('cookie') || '');
  const token = cookies.token;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return NextResponse.next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/workspace', '/videos', '/trash', '/feedback', '/help&support'],
};
