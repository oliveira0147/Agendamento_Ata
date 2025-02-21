import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    const minutes = await prisma.minutes.update({
      where: {
        meetingId: context.params.id
      },
      data: {
        location: data.location,
        participants: data.participants,
        objective: data.objective,
        agenda: data.agenda,
        discussions: data.discussions,
        decisions: data.decisions,
        actions: data.actions,
        nextSteps: data.nextSteps,
        observations: data.observations,
        secretary: data.secretary,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ata atualizada com sucesso',
      minutes
    });

  } catch (error) {
    console.error('Erro ao atualizar ata:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao atualizar ata'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const data = await request.json();

    const meeting = await prisma.meeting.findUnique({
      where: { id: context.params.id },
      include: { minutes: true }
    });

    if (!meeting) {
      return NextResponse.json({
        success: false,
        message: 'Reunião não encontrada'
      }, { status: 404 });
    }

    if (meeting.minutes) {
      return NextResponse.json({
        success: false,
        message: 'Esta reunião já possui uma ata'
      }, { status: 400 });
    }

    const minutes = await prisma.minutes.create({
      data: {
        meetingId: context.params.id,
        location: data.location,
        participants: data.participants,
        objective: data.objective,
        agenda: data.agenda,
        discussions: data.discussions,
        decisions: data.decisions,
        actions: data.actions,
        nextSteps: data.nextSteps,
        observations: data.observations,
        secretary: data.secretary
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ata criada com sucesso',
      minutes
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar ata:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao criar ata'
    }, { status: 500 });
  }
} 