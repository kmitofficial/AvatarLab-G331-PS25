import { parse } from "cookie";
import { jwtDecode } from "jwt-decode";
import { getSession } from "next-auth/react";

export const getEmail = async () => {
  try {
    // Try reading token from cookies
    const cookie = parse(document.cookie);
    const token = cookie.token;

    if (token) {
      const decoded = jwtDecode(token) as {
        email: string;
        username: string;
        image: string;
      };
      return {
        email: decoded.email,
        username: decoded.username,
        image: decoded.image,
      };
    }

    // Fall back to next-auth session (OAuth)
    const session = await getSession();
    if (session?.user?.email) {
      return {
        email: session.user.email,
        username: session.user.name ?? "",
        image: session.user.image ?? "",
      };
    }

    return null;
  } catch (error) {
    console.error("getEmail() failed:", error);
    return null;
  }
};
