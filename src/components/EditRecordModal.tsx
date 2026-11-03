import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle, Save } from 'lucide-react';
import { AdminRecord } from '../types';
import { COMMUNITIES } from '../config/communities';

interface EditRecordModalProps {
  record: AdminRecord;
  password: string;
  onClose: () => void;
  onSaved: (updated: AdminRecord) => void;
  onUnauthorized: () => void;
}

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20 disabled:opacity-60';
const labelClass = 'block text-xs sm:text-sm font-semibold mb-1.5';

export const EditRecordModal: React.FC<EditRecordModalProps> = ({ record, password, onClose, onSaved, onUnauthorized }) => {
  const [form, setForm] = useState({
    nombreCompleto: record.nombre_completo,
    edad: String(record.edad),
    sexo: record.sexo,
    telefono: record.telefono,
    comunidad: record.comunidad || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSaving, onClose]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): string | null => {
    const name = form.nombreCompleto.trim();
    if (name.length < 3 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(name)) return 'Revisa el nombre (solo letras, mínimo 3).';
    const age = Number(form.edad);
    if (!/^\d+$/.test(form.edad.trim()) || age < 10 || age > 99) return 'La edad debe estar entre 10 y 99 años.';
    if (!form.sexo) return 'Selecciona el sexo.';
    const digits = form.telefono.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return 'El teléfono debe tener entre 8 y 15 dígitos.';
    if (!form.comunidad) return 'Selecciona la comunidad.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ folio: record.folio, ...form }),
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok || result?.status !== 'success') {
        throw new Error(result?.message || `Error en el servidor (${response.status})`);
      }
      onSaved(result.data);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar el cambio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={() => !isSaving && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 id="edit-title" className="text-lg font-extrabold tracking-tight">
              Editar registro
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {record.folio} · registrado {record.registrado_cdmx}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            title="Cerrar"
            className="p-2 -m-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className={labelClass}>Nombre completo</label>
            <input id="edit-name" type="text" disabled={isSaving} value={form.nombreCompleto} onChange={set('nombreCompleto')} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-age" className={labelClass}>Edad</label>
              <input id="edit-age" type="number" inputMode="numeric" min="10" max="99" disabled={isSaving} value={form.edad} onChange={set('edad')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-sex" className={labelClass}>Sexo</label>
              <select id="edit-sex" disabled={isSaving} value={form.sexo} onChange={set('sexo')} className={`${inputClass} cursor-pointer`}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="edit-phone" className={labelClass}>Teléfono</label>
            <input id="edit-phone" type="tel" inputMode="tel" disabled={isSaving} value={form.telefono} onChange={set('telefono')} className={`${inputClass} font-mono`} />
          </div>

          <div>
            <label htmlFor="edit-community" className={labelClass}>Comunidad</label>
            <select id="edit-community" disabled={isSaving} value={form.comunidad} onChange={set('comunidad')} className={`${inputClass} cursor-pointer`}>
              <option value="" disabled>Selecciona la comunidad</option>
              {COMMUNITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition cursor-pointer min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#F3B22B] hover:bg-[#E5A51F] text-[#222222] transition cursor-pointer min-h-[44px] disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};
