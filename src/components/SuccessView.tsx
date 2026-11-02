import React, { useState } from 'react';
import { CheckCircle2, User, Calendar, Phone, Hash, Copy, Check, RotateCcw } from 'lucide-react';
import { RegistrationRecord } from '../types';

interface SuccessViewProps {
  record: RegistrationRecord;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ record, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `REGISTRO DE NUEVOS INTEGRANTES\nID: ${record.id}\nNombre: ${record.fullName}\nEdad: ${record.age}\nSexo: ${record.gender}\nTeléfono: ${record.phone}\nFecha (Hora CDMX): ${record.registeredAt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 border border-gray-100 p-4 sm:p-8 md:p-10 text-center animate-fadeIn">
      {/* Success Icon */}
      <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-3 sm:mb-4 shadow-xs">
        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#F3B22B]/15 text-[#222222] border border-[#F3B22B]/40 mb-2">
        ¡Registro Completado con Éxito!
      </span>

      <h2 className="text-xl sm:text-3xl font-extrabold text-[#222222] tracking-tight mb-1.5 sm:mb-2">
        ¡Te has registrado con éxito!
      </h2>

      <p className="text-xs sm:text-base text-gray-600 max-w-md mx-auto mb-4 sm:mb-6">
        Tus datos han sido registrados exitosamente.
      </p>

      {/* Official Ticket Card */}
      <div className="max-w-md mx-auto bg-gradient-to-b from-[#FBFBFC] to-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-5 sm:mb-6 text-left shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F3B22B]" />

        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 sm:mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Código / ID de Registro
            </span>
            <div className="flex items-center gap-1.5 font-mono text-lg sm:text-xl font-bold text-[#222222]">
              <Hash className="w-4 h-4 text-[#F3B22B]" />
              <span>{record.id}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition cursor-pointer min-h-[36px]"
            title="Copiar comprobante"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Registered Details */}
        <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Nombre completo</p>
              <p className="text-[#222222] font-semibold break-words">{record.fullName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Edad</p>
                <p className="text-[#222222] font-semibold">{record.age} años</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Sexo</p>
              <p className="text-[#222222] font-semibold">{record.gender}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1 border-t border-gray-100">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Teléfono registrado</p>
              <p className="text-[#222222] font-semibold font-mono">{record.phone}</p>
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] text-gray-400 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Fecha y hora (CDMX): {record.registeredAt}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-[#F3B22B] hover:bg-[#E5A51F] text-[#222222] transition shadow-xs cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Registrar a otra persona</span>
        </button>
      </div>
    </div>
  );
};
