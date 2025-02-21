import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: params.id,
      },
      include: {
        minutes: {
          select: {
            id: true,
            location: true,
            participants: true,
            objective: true,
            agenda: true,
            discussions: true,
            decisions: true,
            actions: true,
            nextSteps: true,
            observations: true,
            secretary: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({
        success: false,
        message: 'Reunião não encontrada'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Erro ao buscar reunião:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar reunião'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Primeiro excluir a ata se existir
    const minutes = await prisma.minutes.findFirst({
      where: { meetingId: params.id }
    });

    if (minutes) {
      await prisma.minutes.delete({
        where: { id: minutes.id }
      });
    }

    // Depois excluir a reunião
    const meeting = await prisma.meeting.delete({
      where: {
        id: params.id,
      },
    });

    if (!meeting) {
      return NextResponse.json({
        success: false,
        message: 'Reunião não encontrada'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reunião excluída com sucesso',
      meeting
    });
  } catch (error) {
    console.error('Erro ao excluir reunião:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao excluir reunião',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 