import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido');
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email e senha são obrigatórios'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        permissions: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: 'Senha incorreta'
      }, { status: 401 });
    }

    // Criar token com jose
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 horas
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao fazer login'
    }, { status: 500 });
  }
} 