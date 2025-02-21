import { NextResponse } from 'next/server';
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

    // Aqui você implementaria a lógica para buscar as atividades do usuário
    const activities = [
      {
        id: '1',
        action: 'Login realizado',
        date: new Date(),
        ip: '192.168.1.1',
        device: 'Chrome/Windows'
      },
    ];

    return new NextResponse(
      JSON.stringify({ activities }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao buscar atividades' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 