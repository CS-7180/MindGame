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

    // Paths accessible to anyone (signed in or not)
    const publicPaths = ["/", "/api-docs"];
    // Paths only accessible to users who are NOT signed in
    const authPaths = ["/login", "/signup"];

    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);
    const isAuthPath = authPaths.some(p => request.nextUrl.pathname.startsWith(p));

    // If user is not signed in and the path is not public or an auth path, redirect to /login
    if (!user && !isPublicPath && !isAuthPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If user IS signed in and trying to access auth paths (login/signup), redirect to /home
    if (user && isAuthPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
