import FreeMinutesForm from '@/components/FreeMinutesForm';
import BackButton from '@/components/BackButton';

export default function NewFreeMeetingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <BackButton />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <FreeMinutesForm />
        </div>
      </div>
    </div>
  );
} 