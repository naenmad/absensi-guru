import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Jika env belum diset dengan benar (masih placeholder awal), izinkan akses agar tidak crash saat dev awal
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  const path = request.nextUrl.pathname;

  // 1. Jika belum login dan mencoba akses area terproteksi
  if (!user && (path.startsWith('/admin') || path.startsWith('/guru'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Jika sudah login
  if (user) {
    // Ambil role dari profiles atau user_metadata
    let role = user.user_metadata?.role;

    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      role = profile?.role || 'GURU';
    }

    // Jika sedang di halaman login atau root `/`
    if (path === '/login' || path === '/') {
      const url = request.nextUrl.clone();
      url.pathname = role === 'ADMIN' ? '/admin' : '/guru';
      return NextResponse.redirect(url);
    }

    // Role Guard: Guru tidak boleh ke /admin
    if (role === 'GURU' && path.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/guru';
      return NextResponse.redirect(url);
    }

    // Role Guard: Admin diarahkan ke /admin jika membuka /guru
    if (role === 'ADMIN' && path.startsWith('/guru')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
