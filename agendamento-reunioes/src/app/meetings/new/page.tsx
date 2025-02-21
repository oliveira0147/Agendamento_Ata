'use client'

import NewMeetingForm from '@/components/NewMeetingForm';

export default function NewMeetingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Agendar Nova Reunião</h1>
        <NewMeetingForm />
      </div>
    </div>
  );
} 