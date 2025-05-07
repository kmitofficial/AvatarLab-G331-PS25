import { parse } from 'cookie'
import {jwtDecode} from "jwt-decode";

export const getEmail = () => {
  console.log(document.cookie)
  const cookie = parse(document.cookie);
  const token = cookie.token;
  if (!token) return null;

  try {
    const decoded = jwtDecode(token) as { email: string,username:string,image:string };
    return {email:decoded.email,username:decoded.username,image:decoded.image};
  } catch {
    return null;
  }
};