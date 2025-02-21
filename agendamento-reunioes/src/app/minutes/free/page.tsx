'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { prisma } from '@/lib/prisma';
import BackButton from '@/components/BackButton';

export default function FreeMeetingsPage() {
  const [freeMeetings, setFreeMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const response = await fetch('/api/minutes/free');
        const data = await response.json();
        setFreeMeetings(data.meetings);
      } catch (error) {
        console.error('Erro ao buscar atas livres:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeetings();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <BackButton />
          <Link
            href="/minutes/free/new"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Nova Ata Livre
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Atas Livres</h1>

        <div className="grid gap-6">
          {freeMeetings.length > 0 ? (
            freeMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {meeting.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {new Date(meeting.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    {meeting.minutes ? 'Ver Ata' : 'Criar Ata'}
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              Não há atas livres registradas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 