import Link from 'next/link';
import MeetingsList from '@/components/MeetingsList';
import { prisma } from '@/lib/prisma';
import { Meeting, User } from '@prisma/client';

export const dynamic = 'force-dynamic';

function adjustDate(date: Date): Date {
  // Ajusta o fuso horário para meia-noite UTC
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ));
}

interface ExtendedMeeting extends Meeting {
  participants: Pick<User, 'id' | 'name' | 'email'>[];
  minutes: {
    id: string;
    content: string;
  } | null;
  relatedMeetings: ExtendedMeeting[];
}

interface MeetingListItem {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: Date;
  duration: number;
  roomId: string;
  roomName: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  minutes: {
    id: string;
    content: string;
  } | null;
  isRecurring: boolean;
  recurrenceId: string | null;
  recurrenceType: string | null;
  recurrenceEndDate: Date | null;
  isFreeMinutes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MeetingListProps {
  initialMeetings: Array<{
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: Date;
    duration: number;
    roomId: string;
    roomName: string;
    participants: Array<{
      id: string;
      name: string;
      email: string;
    }>;
    minutes: {
      id: string;
      content: string;
    } | null;
  }>;
}

export default async function MeetingsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allMeetings = await prisma.meeting.findMany({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      minutes: {
        select: {
          id: true,
          content: true,
        }
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  const formattedMeetings: ExtendedMeeting[] = allMeetings.map(meeting => ({
    ...meeting,
    participants: meeting.participants,
    minutes: meeting.minutes,
    relatedMeetings: [], // Inicializa como array vazio
    startTime: meeting.startTime,
    endTime: meeting.endTime,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Reuniões de Hoje</h1>
          <div className="flex gap-4">
            <Link
              href="/meetings/all"
              className="text-teal-600 hover:text-teal-700 px-4 py-2 rounded-lg border border-teal-600 hover:bg-teal-50 transition-colors"
            >
              Ver Todas
            </Link>
            <Link
              href="/meetings/new"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Nova Reunião
            </Link>
          </div>
        </div>

        {formattedMeetings.length > 0 ? (
          <MeetingsList initialMeetings={formattedMeetings} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Não há reuniões agendadas para hoje.
          </div>
        )}
      </div>
    </div>
  );
}

function calculateDuration(startTime: string, endTime: Date): number {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  return (endHours - hours) + (endMinutes - minutes) / 60;
} 