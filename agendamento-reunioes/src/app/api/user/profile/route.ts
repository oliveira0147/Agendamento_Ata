import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao buscar perfil' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 