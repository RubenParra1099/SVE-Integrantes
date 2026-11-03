import React, { useState } from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { SuccessView } from './components/SuccessView';
import { Footer } from './components/Footer';
import { RegistrationFormData, RegistrationRecord, SubmissionStatus } from './types';
import { submitRegistration } from './services/registrationService';
import { normalizePhone } from './config/phone';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [lastRecord, setLastRecord] = useState<RegistrationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: RegistrationFormData) => {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await submitRegistration(formData);
      if (response.success) {
        let formattedDate = response.registeredAt;
        if (!formattedDate) {
          const now = new Date();
          formattedDate = new Intl.DateTimeFormat('es-MX', {
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(now);
        }

        setLastRecord({
          ...formData,
          phone: normalizePhone(formData.phone),
          id: response.id || '—',
          registeredAt: formattedDate,
        });
        setStatus('success');
      } else {
        throw new Error(response.message || 'No se pudo completar el registro.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(
        err.message || 'Ocurrió un problema al enviar el formulario. Por favor intenta nuevamente.'
      );
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLastRecord(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#222222] flex flex-col justify-between selection:bg-[#F3B22B]/20 selection:text-[#222222] relative overflow-x-hidden">
      
      {/* Decorative ambient background accents */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#F3B22B]/15 via-[#F3B22B]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        
        {/* Header */}
        <Header />

        {/* Global Error Alert Banner if submission failed */}
        {errorMessage && status === 'error' && (
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 animate-fadeIn">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900 text-xs sm:text-sm">Error al procesar el registro</p>
              <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-600 hover:text-rose-900 font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Active Content: Form or Success View */}
        {status === 'success' && lastRecord ? (
          <SuccessView
            record={lastRecord}
            onReset={handleReset}
          />
        ) : (
          <RegistrationForm
            onSubmit={handleSubmit}
            isLoading={status === 'submitting'}
          />
        )}

        {/* Footer */}
        <Footer />
      </main>

    </div>
  );
}
