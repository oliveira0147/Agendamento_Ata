import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Função auxiliar para verificar sobreposição de horários
function hasTimeConflict(
  startTime1: string,
  duration1: number,
  startTime2: string,
  duration2: number
): boolean {
  // Converte horários para minutos para facilitar comparação
  const [hours1, minutes1] = startTime1.split(':').map(Number);
  const [hours2, minutes2] = startTime2.split(':').map(Number);
  
  const start1 = hours1 * 60 + minutes1;
  const end1 = start1 + duration1 * 60;
  
  const start2 = hours2 * 60 + minutes2;
  const end2 = start2 + duration2 * 60;

  // Verifica se há sobreposição
  return (start1 < end2 && end1 > start2);
}

export async function POST(request: Request) {
  try {
    const { 
      title, date, startTime, endTime, roomId, roomName,
      participantIds = [], // Valor padrão caso não seja fornecido
      viewerIds = [], // Valor padrão caso não seja fornecido
      isRecurring, recurrenceType, recurrenceEndDate 
    } = await request.json();

    // Validar dados obrigatórios
    if (!title || !date || !startTime || !endTime || !roomId) {
      return new NextResponse(
        JSON.stringify({ error: 'Dados incompletos' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Ajusta a data para o fuso horário local
    const [year, month, day] = date.split('-').map(Number);
    const meetingDate = new Date(year, month - 1, day);
    
    // Se for uma reunião recorrente, cria um ID de recorrência
    const recurrenceId = isRecurring ? uuidv4() : null;

    // Preparar conexões de participantes e visualizadores apenas se houver IDs
    const participantsConnect = participantIds.length > 0 ? {
      connect: participantIds.map((id: string) => ({ id }))
    } : undefined;

    const viewersConnect = viewerIds.length > 0 ? {
      connect: viewerIds.map((id: string) => ({ id }))
    } : undefined;

    // Criar a reunião
    const meeting = await prisma.meeting.create({
      data: {
        title,
        date: meetingDate,
        startTime,
        endTime: new Date(`${date}T${endTime}`),
        duration: calculateDuration(startTime, endTime),
        roomId,
        roomName,
        isRecurring: isRecurring || false,
        recurrenceId,
        recurrenceType: isRecurring ? recurrenceType : null,
        recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        ...(participantsConnect && { participants: participantsConnect }),
        ...(viewersConnect && { viewers: viewersConnect }),
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, meeting }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao criar reunião:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao criar reunião' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return (endTotal - startTotal) / 60;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const roomId = searchParams.get('roomId');

  if (!date || !roomId) {
    return new NextResponse(
      JSON.stringify({ error: 'Data e sala são obrigatórios' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        date: new Date(date),
        roomId: roomId,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return new NextResponse(
      JSON.stringify({ meetings }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar reuniões:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao buscar reuniões' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 