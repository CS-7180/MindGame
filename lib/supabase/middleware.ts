import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If user is not signed in and the path is not /login, /signup, /, or /api-docs, redirect to /login
    const publicPaths = ["/login", "/signup", "/", "/api-docs"];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname) ||
        ["/login", "/signup"].some(p => request.nextUrl.pathname.startsWith(p));

    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If user IS signed in and trying to access /login or /signup, redirect to /home
    if (user && isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
