import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');

    if (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD) {
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
                return NextResponse.next();
            }
        }

        return new NextResponse('Auth Required.', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}
