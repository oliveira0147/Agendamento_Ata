'use client';

import { useState } from 'react';
import DeleteMeetingButton from './DeleteMeetingButton';
import { Meeting as PrismaMeeting } from '@prisma/client';

interface Meeting extends PrismaMeeting {
  participants: {
    id: string;
    name: string;
    email: string;
  }[];
  minutes: {
    id: string;
    content: string;
  } | null;
  relatedMeetings: Meeting[];
}

const ChevronDownIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
  </svg>
);

interface MeetingListProps {
  initialMeetings: Meeting[];
}

export default function MeetingsList({ initialMeetings }: MeetingListProps) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [expandedMeetings, setExpandedMeetings] = useState<Record<string, boolean>>({});

  const toggleExpand = (meetingId: string) => {
    setExpandedMeetings(prev => ({
      ...prev,
      [meetingId]: !prev[meetingId]
    }));
  };

  const formatDate = (date: Date): string => {
    // Ajusta a data para o fuso horário local
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();
    
    // Cria uma nova data com os componentes locais
    const adjustedDate = new Date(year, month, day);
    
    return adjustedDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const formatRecurrence = (meeting: Meeting) => {
    if (!meeting.isRecurring) return '';

    const types = {
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      monthly: 'Mensalmente',
    };

    return `${types[meeting.recurrenceType as keyof typeof types]} até ${
      new Date(meeting.recurrenceEndDate!).toLocaleDateString('pt-BR')
    }`;
  };

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => meeting.relatedMeetings.length > 0 && toggleExpand(meeting.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {meeting.title}
                  </h2>
                  {meeting.relatedMeetings.length > 0 && (
                    <span className="text-teal-600">
                      {expandedMeetings[meeting.id] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-gray-600">
                  <p><span className="font-medium">Data:</span> {formatDate(meeting.date)}</p>
                  <p><span className="font-medium">Horário:</span> {meeting.startTime}</p>
                  <p><span className="font-medium">Sala:</span> {meeting.roomName}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <a
                  href={`/meetings/${meeting.id}/minutes`}
                  className="px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <DeleteMeetingButton 
                  id={meeting.id}
                  isRecurring={meeting.isRecurring}
                  recurrenceId={meeting.recurrenceId}
                  onDelete={() => {
                    setMeetings(meetings.filter(m => m.id !== meeting.id));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reuniões relacionadas (dropdown) */}
          {expandedMeetings[meeting.id] && meeting.relatedMeetings.length > 0 && (
            <div className="border-t border-gray-200">
              {meeting.relatedMeetings.map((relatedMeeting) => (
                <div 
                  key={relatedMeeting.id}
                  className="p-4 pl-8 border-b border-gray-100 last:border-b-0 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Data:</span> {formatDate(relatedMeeting.date)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Horário:</span> {relatedMeeting.startTime}
                      </p>
                    </div>
                    <a
                      href={`/meetings/${relatedMeeting.id}/minutes`}
                      className="px-3 py-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 