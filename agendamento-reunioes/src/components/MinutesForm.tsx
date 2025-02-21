'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MinutesFormProps {
  meeting: {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    roomName: string;
    participants?: {
      id: string;
      name: string;
      email: string;
    }[];
  };
}

export default function MinutesForm({ meeting }: MinutesFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    location: '',
    participants: meeting.participants ? meeting.participants.map(p => p.name).join(', ') : '',
    objective: '',
    agenda: '',
    discussions: '',
    decisions: '',
    actions: '',
    nextSteps: '',
    observations: '',
    secretary: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/minutes/${meeting.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar ata');
      }

      router.push(`/meetings/${meeting.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar ata');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Nova Ata: {meeting.title}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Local
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Participantes
        </label>
        <textarea
          value={formData.participants}
          onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Objetivo
        </label>
        <input
          type="text"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pauta
        </label>
        <textarea
          value={formData.agenda}
          onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Discussões
        </label>
        <textarea
          value={formData.discussions}
          onChange={(e) => setFormData({ ...formData, discussions: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Decisões
        </label>
        <textarea
          value={formData.decisions}
          onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ações
        </label>
        <textarea
          value={formData.actions}
          onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Próximos Passos
        </label>
        <textarea
          value={formData.nextSteps}
          onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Secretário(a)
        </label>
        <input
          type="text"
          value={formData.secretary}
          onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}
          `}
        >
          {isLoading ? 'Salvando...' : 'Salvar Ata'}
        </button>
      </div>
    </form>
  );
} 