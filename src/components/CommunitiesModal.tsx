import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2, AlertCircle, Plus, Pencil, Trash2, Check, ListPlus } from 'lucide-react';
import { AdminRecord } from '../types';
import { cleanCommunity, isValidCommunity } from '../config/communities';

interface CommunitiesModalProps {
  communities: string[];
  records: AdminRecord[];
  password: string;
  onClose: () => void;
  onChanged: (communities: string[], message: string, renamed?: { from: string; to: string }) => void;
  onUnauthorized: () => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20 disabled:opacity-60';
const smallButton =
  'inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#F3B22B] hover:bg-[#F3B22B]/10 transition cursor-pointer disabled:opacity-60 min-h-[34px]';

export const CommunitiesModal: React.FC<CommunitiesModalProps> = ({ communities, records, password, onClose, onChanged, onUnauthorized }) => {
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<{ from: string; value: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSaving, onClose]);

  // Cuántos registros tiene cada comunidad
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      if (r.comunidad) map.set(r.comunidad, (map.get(r.comunidad) ?? 0) + 1);
    }
    return map;
  }, [records]);

  // Comunidades que la gente escribió al registrarse y no están en la lista
  const unlisted = useMemo(
    () => [...counts.keys()].filter((c) => !communities.includes(c)).sort((a, b) => a.localeCompare(b, 'es')),
    [counts, communities]
  );

  const request = async (method: string, body?: object, query = '') => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/communities${query}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        onUnauthorized();
        return null;
      }
      if (!response.ok || result?.status !== 'success') {
        throw new Error(result?.message || `Error en el servidor (${response.status})`);
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar el cambio.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async (name: string) => {
    const nombre = cleanCommunity(name);
    if (!isValidCommunity(nombre)) {
      setError('El nombre debe tener entre 3 y 100 caracteres.');
      return;
    }
    const result = await request('POST', { nombre });
    if (result) {
      if (cleanCommunity(newName) === nombre) setNewName('');
      onChanged(result.data, `"${nombre}" se agregó a la lista.`);
    }
  };

  const handleRename = async () => {
    if (!renaming) return;
    const to = cleanCommunity(renaming.value);
    if (!isValidCommunity(to)) {
      setError('El nombre debe tener entre 3 y 100 caracteres.');
      return;
    }
    if (to === renaming.from) {
      setRenaming(null);
      return;
    }
    const result = await request('PATCH', { from: renaming.from, to });
    if (result) {
      const merged = communities.includes(to) || counts.has(to);
      const n = result.updatedRecords ?? 0;
      const detail = n > 0 ? ` (${n} registro${n === 1 ? '' : 's'} actualizado${n === 1 ? '' : 's'})` : '';
      onChanged(
        result.data,
        `${merged ? `"${renaming.from}" se unió con` : `"${renaming.from}" ahora se llama`} "${to}"${detail}.`,
        { from: renaming.from, to }
      );
      setRenaming(null);
    }
  };

  const handleDelete = async (nombre: string) => {
    const result = await request('DELETE', undefined, `?nombre=${encodeURIComponent(nombre)}`);
    setConfirmingDelete(null);
    if (result) onChanged(result.data, `"${nombre}" se quitó de la lista.`);
  };

  const renderRow = (name: string, listed: boolean) => {
    const count = counts.get(name) ?? 0;

    if (renaming?.from === name) {
      const target = cleanCommunity(renaming.value);
      const willMerge = target !== name && (communities.includes(target) || counts.has(target));
      return (
        <li key={name} className="p-3 rounded-xl border border-[#F3B22B] bg-[#F3B22B]/5">
          <input
            autoFocus
            maxLength={100}
            list="communities-datalist"
            disabled={isSaving}
            value={renaming.value}
            aria-label={`Nuevo nombre para ${name}`}
            onChange={(e) => setRenaming({ from: name, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRename();
              }
            }}
            className={inputClass}
          />
          <p className="text-[11px] text-gray-500 mt-1.5">
            {willMerge
              ? `Ya existe "${target}": se unirán en una sola.`
              : 'Escribe el nombre correcto o elige uno de la lista para unirlas.'}
            {count > 0 && ` Se actualizarán ${count} registro${count === 1 ? '' : 's'}.`}
          </p>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => setRenaming(null)} disabled={isSaving} className={`${smallButton} flex-1`}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRename}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#F3B22B] hover:bg-[#E5A51F] text-[#222222] transition cursor-pointer disabled:opacity-60 min-h-[34px]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Guardar
            </button>
          </div>
        </li>
      );
    }

    if (confirmingDelete === name) {
      return (
        <li key={name} className="p-3 rounded-xl bg-rose-50 border border-rose-200">
          <p className="text-xs sm:text-sm text-rose-900 font-semibold">¿Quitar "{name}" de la lista?</p>
          <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5">
            Ya no aparecerá en el formulario.
            {count > 0 && ` Sus ${count} registro${count === 1 ? '' : 's'} no se borran.`}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(null)}
              disabled={isSaving}
              className="flex-1 py-2 rounded-lg text-xs font-semibold border border-rose-200 bg-white text-rose-800 hover:bg-rose-100 transition cursor-pointer min-h-[34px]"
            >
              No, conservar
            </button>
            <button
              type="button"
              onClick={() => handleDelete(name)}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer min-h-[34px] disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Sí, quitar
            </button>
          </div>
        </li>
      );
    }

    return (
      <li key={name} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-white">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{name}</p>
          <p className="text-[11px] text-gray-500">
            {count} registro{count === 1 ? '' : 's'}
          </p>
        </div>
        {!listed && (
          <button type="button" onClick={() => handleAdd(name)} disabled={isSaving} title="Agregar a la lista" className={smallButton}>
            <ListPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setConfirmingDelete(null);
            setRenaming({ from: name, value: name });
          }}
          disabled={isSaving}
          title={listed ? 'Renombrar' : 'Corregir o unir con otra'}
          className={smallButton}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{listed ? 'Renombrar' : 'Corregir'}</span>
        </button>
        {listed && (
          <button
            type="button"
            onClick={() => {
              setRenaming(null);
              setConfirmingDelete(name);
            }}
            disabled={isSaving}
            title="Quitar de la lista"
            aria-label={`Quitar ${name}`}
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-60 min-h-[34px] min-w-[34px]"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </li>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={() => !isSaving && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="communities-title"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 id="communities-title" className="text-lg font-extrabold tracking-tight">
              Comunidades
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">La lista que aparece en el formulario de registro</p>
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

        <datalist id="communities-datalist">
          {communities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/* Agregar comunidad */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd(newName);
          }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            maxLength={100}
            disabled={isSaving}
            placeholder="Nombre de la nueva comunidad"
            aria-label="Nombre de la nueva comunidad"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={isSaving || !newName.trim()}
            className="inline-flex items-center gap-1.5 px-3 rounded-xl font-bold text-sm bg-[#F3B22B] hover:bg-[#E5A51F] text-[#222222] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </form>

        {error && (
          <p className="mb-3 text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          En la lista ({communities.length})
        </h3>
        <ul className="space-y-1.5">{communities.map((c) => renderRow(c, true))}</ul>

        {unlisted.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-5 mb-1">
              Escritas al registrarse ({unlisted.length})
            </h3>
            <p className="text-[11px] text-gray-500 mb-2">
              No están en la lista. Agrégalas, o corrígelas para unirlas con una existente.
            </p>
            <ul className="space-y-1.5">{unlisted.map((c) => renderRow(c, false))}</ul>
          </>
        )}
      </div>
    </div>
  );
};
