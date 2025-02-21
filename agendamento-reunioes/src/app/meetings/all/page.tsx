import Link from 'next/link';
import MeetingsList from '@/components/MeetingsList';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface GroupedMeeting extends Meeting {
  relatedMeetings: Meeting[];
}

export default async function AllMeetingsPage() {
  // Ajustar data atual para início do dia no fuso horário local
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const allMeetings = await prisma.meeting.findMany({
    where: {
      date: {
        gte: todayStart,
      },
    },
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      roomId: true,
      roomName: true,
      isRecurring: true,
      recurrenceId: true,
      recurrenceType: true,
      recurrenceEndDate: true,
    },
    orderBy: [
      { date: 'asc' },
    ],
  });

  // Agrupar reuniões por recorrenceId ou id individual
  const groupedMeetings = allMeetings.reduce((acc: Record<string, GroupedMeeting>, meeting) => {
    const key = meeting.recurrenceId || meeting.id;
    
    if (!acc[key]) {
      acc[key] = {
        ...meeting,
        relatedMeetings: [],
      };
    } else if (meeting.recurrenceId) {
      acc[key].relatedMeetings.push(meeting);
    }
    
    return acc;
  }, {} as Record<string, GroupedMeeting>);

  const meetings = Object.values(groupedMeetings)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Todas as Reuniões</h1>
          <div className="flex gap-4">
            <Link
              href="/meetings"
              className="text-teal-600 hover:text-teal-700 px-4 py-2 rounded-lg border border-teal-600 hover:bg-teal-50 transition-colors"
            >
              Reuniões de Hoje
            </Link>
            <Link
              href="/meetings/new"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Nova Reunião
            </Link>
          </div>
        </div>

        {meetings.length > 0 ? (
          <MeetingsList initialMeetings={meetings} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Não há reuniões agendadas.
          </div>
        )}
      </div>
    </div>
  );
} 