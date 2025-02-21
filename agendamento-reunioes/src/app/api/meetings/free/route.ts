import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { title, date, participants } = await request.json();

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
        participants: {
          connect: participants.map((id: string) => ({ id }))
        }
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, meeting }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao criar ata livre:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao criar ata livre' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 