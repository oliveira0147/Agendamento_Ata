'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import BackButton from '@/components/BackButton';
import EditButton from '@/components/EditButton';
import { Meeting, Minutes } from '@prisma/client';

interface MeetingWithDetails {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  roomName: string;
  minutes: Minutes | null;
  participants: {
    id: string;
    name: string;
    email: string;
  }[];
}

interface EditedMinutes {
  location: string;
  participants: string;
  objective: string;
  agenda: string;
  discussions: string;
  decisions: string;
  actions: string;
  nextSteps: string;
  observations: string;
  secretary: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState<EditedMinutes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const response = await fetch(`/api/meetings/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar reunião');
        }

        setMeeting(data.meeting);
        if (data.meeting.minutes) {
          const { id, meetingId, createdAt, updatedAt, content, ...minutesData } = data.meeting.minutes;
          setEditedMinutes(minutesData as EditedMinutes);
        } else {
          setEditedMinutes({
            location: '',
            participants: data.meeting.participants?.map(p => p.name).join(', ') || '',
            objective: '',
            agenda: '',
            discussions: '',
            decisions: '',
            actions: '',
            nextSteps: '',
            observations: '',
            secretary: ''
          });
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar reunião');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeeting();
  }, [resolvedParams.id]);

  const handleEdit = () => {
    if (meeting?.minutes) {
      const { id, meetingId, createdAt, updatedAt, content, ...minutesData } = meeting.minutes;
      setEditedMinutes(minutesData as EditedMinutes);
    }
    setIsEditing(true);
  };

  const handleInputChange = (field: keyof EditedMinutes, value: string) => {
    if (editedMinutes) {
      setEditedMinutes({
        ...editedMinutes,
        [field]: value
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/minutes/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedMinutes),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar alterações');
      }

      const data = await response.json();
      setMeeting(prev => prev ? { ...prev, minutes: data.minutes } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200 m-4">
        <p className="font-medium">Erro ao carregar dados</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <BackButton />
          <EditButton onClick={handleEdit} isEditing={isEditing} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {meeting.title}
            </h1>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={editedMinutes.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participantes
                  </label>
                  <textarea
                    value={editedMinutes.participants}
                    onChange={(e) => handleInputChange('participants', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Objetivo</h3>
                  <input
                    type="text"
                    value={editedMinutes.objective}
                    onChange={(e) => handleInputChange('objective', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Pauta</h3>
                  <input
                    type="text"
                    value={editedMinutes.agenda}
                    onChange={(e) => handleInputChange('agenda', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Discussões</h3>
                  <input
                    type="text"
                    value={editedMinutes.discussions}
                    onChange={(e) => handleInputChange('discussions', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Decisões</h3>
                  <input
                    type="text"
                    value={editedMinutes.decisions}
                    onChange={(e) => handleInputChange('decisions', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Ações</h3>
                  <input
                    type="text"
                    value={editedMinutes.actions}
                    onChange={(e) => handleInputChange('actions', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Próximos Passos</h3>
                  <input
                    type="text"
                    value={editedMinutes.nextSteps}
                    onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                {editedMinutes.observations && (
                  <div>
                    <h3 className="text-lg font-semibold">Observações</h3>
                    <input
                      type="text"
                      value={editedMinutes.observations}
                      onChange={(e) => handleInputChange('observations', e.target.value)}
                      className="w-full rounded-lg border-gray-300"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold">Secretário(a)</h3>
                  <input
                    type="text"
                    value={editedMinutes.secretary}
                    onChange={(e) => handleInputChange('secretary', e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div className="prose max-w-none">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Local</h3>
                  <p>{meeting.minutes?.location}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Participantes</h3>
                  <p>{meeting.minutes?.participants}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Objetivo</h3>
                  <p>{meeting.minutes?.objective}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Pauta</h3>
                  <p>{meeting.minutes?.agenda}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Discussões</h3>
                  <p>{meeting.minutes?.discussions}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Decisões</h3>
                  <p>{meeting.minutes?.decisions}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Ações</h3>
                  <p>{meeting.minutes?.actions}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Próximos Passos</h3>
                  <p>{meeting.minutes?.nextSteps}</p>
                </div>
                {meeting.minutes?.observations && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">Observações</h3>
                    <p>{meeting.minutes?.observations}</p>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Secretário(a)</h3>
                  <p>{meeting.minutes?.secretary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 