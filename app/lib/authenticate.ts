import { parse } from 'cookie'
import {jwtDecode} from "jwt-decode";
import { NextRequest } from 'next/server';

export const getEmail = () => {
  console.log(document.cookie)
  const cookie = parse(document.cookie);
  const token = cookie.token;
  console.log(token)
  if (!token) return null;

  try {
    const decoded = jwtDecode(token) as { email: string,username:string,image:string };
    console.log(decoded)
    return {email:decoded.email,username:decoded.username,image:decoded.image};
  } catch {
    return null;
  }
};

export const getUserId = (request?: NextRequest): string | null => {
  let token: string | undefined;

  if (typeof window !== "undefined") {
    console.log("getUserId called (client-side), cookies:");
    const cookie = parse(document.cookie);
    token = cookie.token;
  } else if (request) {
    console.log("getUserId called (server-side), cookies:");
    const cookieHeader = request.headers.get("cookie");
    const cookie = cookieHeader ? parse(cookieHeader) : {};
    token = cookie.token;
  } else {
    console.log("getUserId called (server-side), no request object provided");
    return null;
  }


  if (!token) {
    console.log("No token found");
    return null;
  }

  try {
    // In a real app, you would verify the token (e.g., decode JWT)
    // For this example, assume the token is the userIdentifier
    const userIdentifier = token; // Simplified; replace with actual token parsing/verification
    return userIdentifier;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};