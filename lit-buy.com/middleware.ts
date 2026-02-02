import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const response = await updateSession(request)
    const { pathname } = request.nextUrl

    if (pathname.startsWith("/@")) {
        const raw = pathname.slice(2)
        const creatorName = raw.replace(/^\{|\}$/g, "")
        if (creatorName) {
            const url = request.nextUrl.clone()
            url.pathname = `/creator/${encodeURIComponent(creatorName)}`
            url.search = ""
            const rewrite = NextResponse.rewrite(url)
            response.cookies.getAll().forEach((cookie) => {
                rewrite.cookies.set(cookie.name, cookie.value, cookie)
            })
            return rewrite
        }
    }

    // Strip query params from all routes EXCEPT /finds and /api
    if (request.nextUrl.search && !pathname.startsWith("/api") && !pathname.startsWith("/finds")) {
        const url = request.nextUrl.clone()
        url.search = ""
        const redirect = NextResponse.redirect(url)
        response.cookies.getAll().forEach((cookie) => {
            redirect.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirect
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
