import "server-only";
import { createClient } from "@supabase/supabase-js";
export function createUserServerClient(authorization:string|null){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key||!authorization?.startsWith("Bearer "))return null;return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:authorization}}});}
