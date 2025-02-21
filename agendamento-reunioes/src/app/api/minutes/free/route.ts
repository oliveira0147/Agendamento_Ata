import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Validar body da requisição
    const data = await request.json();
    console.log('Dados recebidos:', data);

    const { title, date } = data;

    if (!title || !date) {
      return NextResponse.json({
        success: false,
        message: 'Título e data são obrigatórios'
      }, { status: 400 });
    }

    // Criar reunião com ata livre
    const meeting = await prisma.meeting.create({
      data: {
        title,
        date: new Date(date),
        startTime: '00:00',
        endTime: new Date(date),
        duration: 0,
        roomId: 'free',
        roomName: 'Ata Livre',
        isFreeMinutes: true,
        minutes: {
          create: {
            content: '',
            location: 'Ata Livre',
            participants: '',
            objective: '',
            agenda: '',
            discussions: '',
            decisions: '',
            actions: '',
            nextSteps: '',
            secretary: '',
            observations: ''
          }
        }
      },
      include: {
        minutes: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ata livre criada com sucesso',
      meeting
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar ata livre:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao criar ata livre'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        isFreeMinutes: true
      },
      include: {
        minutes: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      meetings
    });
  } catch (error) {
    console.error('Erro ao buscar atas livres:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar atas livres'
    }, { status: 500 });
  }
} 