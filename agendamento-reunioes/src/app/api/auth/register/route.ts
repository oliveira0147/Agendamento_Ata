import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos:', data);

    // Validar campos
    const { name, email, password } = data;
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Criar usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        permissions: JSON.stringify({
          permissions: ['CREATE_FREE_MINUTES', 'VIEW_FREE_MINUTES']
        })
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no registro:', error);
    
    return NextResponse.json(
      { success: false, message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 