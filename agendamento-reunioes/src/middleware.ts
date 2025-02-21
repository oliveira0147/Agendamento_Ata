import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

interface DecodedToken {
  userId: string;
  permissions: string[];
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
}

// Função auxiliar para verificar o token
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Rotas públicas que não precisam de autenticação
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/',
    '/minutes/free'
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar permissões para acessar atas
  if (request.nextUrl.pathname.includes('/minutes') && token) {
    try {
      const decoded = payload as DecodedToken;
      
      if (!decoded) {
        throw new Error('Token inválido');
      }

      const permissions = JSON.parse(decoded.permissions as unknown as string).permissions;

      // Verificar permissões para outras atas
      const meetingId = request.nextUrl.pathname.split('/')[2];
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          participants: true,
          viewers: true,
        },
      });

      if (!meeting?.participants.some(p => p.id === decoded.userId) && 
          !meeting?.viewers.some(v => v.id === decoded.userId)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 