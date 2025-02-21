import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const minutes = await prisma.minutes.create({
      data: {
        meetingId: data.meetingId,
        content: data.content,
        location: data.location,
        participants: data.participants,
        objective: data.objective,
        agenda: data.agenda,
        discussions: data.discussions,
        decisions: data.decisions,
        actions: data.actions,
        nextSteps: data.nextSteps,
        observations: data.observations || '',
        secretary: data.secretary,
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, minutes }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao criar ata:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao criar ata' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Rota para buscar ata específica
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get('meetingId');

  if (!meetingId) {
    return NextResponse.json(
      { error: 'ID da reunião é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const minutes = await prisma.minutes.findUnique({
      where: { meetingId },
    });

    return NextResponse.json(minutes || {});
  } catch (error) {
    console.error('Erro ao buscar ata:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ata' },
      { status: 500 }
    );
  }
} 