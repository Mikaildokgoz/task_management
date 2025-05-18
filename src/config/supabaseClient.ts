import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl =
	import.meta.env.VITE_APP_URL ||
	"https://task-management-roan-iota.vercel.app";

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Supabase URL and Anonymous Key are not defined!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		storageKey: "task-management-auth",
		storage: localStorage,
		autoRefreshToken: true,
		flowType: "pkce",
		detectSessionInUrl: true,
	},
	global: {
		headers: {
			"x-redirect-url": `${siteUrl}/auth`,
		},
	},
});
