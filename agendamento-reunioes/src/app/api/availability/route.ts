import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Função auxiliar para gerar horários em intervalos de 30 minutos
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
  }
  return slots;
}

// Função para converter horário em minutos desde meia-noite
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BusySlot {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface PrismaMeeting {
  id: string;
  title: string;
  startTime: string;
  endTime: Date;
}

interface ApiMeeting {
  id: string;
  title: string;
  startTime: string;
  endTime: Date;
}

export async function GET(request: Request) {
  try {
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

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    const meetings = await prisma.meeting.findMany({
      where: {
        date: searchDate,
        roomId: roomId as string,
        isFreeMinutes: false,
      } as Prisma.MeetingWhereInput,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
      },
    }) as unknown as ApiMeeting[];

    const busySlots: BusySlot[] = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      start: meeting.startTime,
      end: meeting.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }));

    const timeSlots = generateTimeSlots().map(time => {
      const timeInMinutes = timeToMinutes(time);
      
      const isSlotBusy = busySlots.some(busy => {
        const busyStartMinutes = timeToMinutes(busy.start);
        const busyEndMinutes = timeToMinutes(busy.end);
        return timeInMinutes >= busyStartMinutes && timeInMinutes < busyEndMinutes;
      });

      return {
        time,
        available: !isSlotBusy,
      };
    });

    return new NextResponse(
      JSON.stringify({ slots: timeSlots, busySlots }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao verificar disponibilidade' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Função auxiliar para calcular o horário de término
function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
} 