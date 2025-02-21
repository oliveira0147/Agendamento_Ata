'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FreeMinutesForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/minutes/free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar ata livre');
      }

      if (data.success) {
        router.push(`/meetings/${data.meeting.id}`);
      } else {
        throw new Error('Erro ao criar ata livre');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar ata livre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Nova Ata Livre</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Data
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}
        `}
      >
        {isLoading ? 'Criando...' : 'Criar Ata Livre'}
      </button>
    </form>
  );
} 