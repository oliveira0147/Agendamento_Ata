import FreeMinutesForm from '@/components/FreeMinutesForm';

export default function NewMinutePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Criar Nova Ata de Reunião
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <FreeMinutesForm />
        </div>
      </div>
    </div>
  );
} 