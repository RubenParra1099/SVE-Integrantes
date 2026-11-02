import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Loader2, AlertCircle, Download, RefreshCw, LogOut, Search, Users } from 'lucide-react';
import { COMMUNITIES } from '../config/communities';

interface AdminRecord {
  folio: string;
  nombre_completo: string;
  edad: number;
  sexo: string;
  telefono: string;
  comunidad: string | null;
  registrado_cdmx: string;
}

const STORAGE_KEY = 'tls_admin_password';

const readStoredPassword = (): string => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const storePassword = (value: string | null) => {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento disponible: se pedirá la contraseña de nuevo al recargar
  }
};

const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (records: AdminRecord[]) => {
  const header = ['Folio', 'Nombre completo', 'Edad', 'Sexo', 'Teléfono', 'Comunidad', 'Fecha de registro (CDMX)'];
  const lines = records.map((r) =>
    [r.folio, r.nombre_completo, r.edad, r.sexo, r.telefono, r.comunidad, r.registrado_cdmx].map(csvCell).join(',')
  );
  // El BOM (﻿) hace que Excel respete los acentos
  const blob = new Blob(['﻿' + [header.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());
  link.href = url;
  link.download = `registros-emaus-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const AdminPage: React.FC = () => {
  const [password, setPassword] = useState(readStoredPassword);
  const [passwordInput, setPasswordInput] = useState('');
  const [records, setRecords] = useState<AdminRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [communityFilter, setCommunityFilter] = useState('');

  useEffect(() => {
    document.title = 'Registros · REGISTRO EMAÚS';
  }, []);

  const loadRecords = async (pw: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/records', { headers: { Authorization: `Bearer ${pw}` } });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        storePassword(null);
        setPassword('');
        setRecords(null);
        throw new Error('Contraseña incorrecta.');
      }
      if (!response.ok || result?.status !== 'success') {
        throw new Error(result?.message || `Error en el servidor (${response.status})`);
      }
      storePassword(pw);
      setPassword(pw);
      setRecords(result.data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los registros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (password) loadRecords(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      if (communityFilter && r.comunidad !== communityFilter) return false;
      if (!term) return true;
      return [r.folio, r.nombre_completo, r.telefono].some((v) => v.toLowerCase().includes(term));
    });
  }, [records, search, communityFilter]);

  const men = filtered.filter((r) => r.sexo === 'Masculino').length;
  const women = filtered.filter((r) => r.sexo === 'Femenino').length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim()) loadRecords(passwordInput.trim());
  };

  const handleLogout = () => {
    storePassword(null);
    setPassword('');
    setPasswordInput('');
    setRecords(null);
  };

  // Pantalla de acceso
  if (!records) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] text-[#222222] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <img src="/favicon-192.png" alt="" className="w-14 h-14 mb-3" />
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Registros EMAÚS</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Acceso solo para coordinadores</p>
          </div>

          <label htmlFor="admin-password" className="block text-xs sm:text-sm font-semibold mb-1.5">
            Contraseña
          </label>
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              disabled={isLoading}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20"
            />
          </div>

          {error && (
            <p className="mb-4 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !passwordInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#F3B22B] hover:bg-[#E5A51F] text-[#222222] transition cursor-pointer min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  // Vista de registros
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#222222]">
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <img src="/favicon-192.png" alt="" className="w-10 h-10" />
            <div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">Registros EMAÚS</h1>
              <p className="text-xs text-gray-500">Noviembre 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadRecords(password)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition cursor-pointer min-h-[40px]"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl font-bold bg-[#F3B22B] hover:bg-[#E5A51F] text-[#222222] transition cursor-pointer min-h-[40px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Descargar Excel (CSV)
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition cursor-pointer min-h-[40px] min-w-[40px]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-5">
          {[
            { label: 'Total', value: filtered.length },
            { label: 'Hombres', value: men },
            { label: 'Mujeres', value: women },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-xs p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-xl sm:text-3xl font-extrabold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              placeholder="Buscar por nombre, teléfono o folio"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#F3B22B] focus:ring-2 focus:ring-[#F3B22B]/20"
            />
          </div>
          <div className="relative sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Users className="w-4 h-4" />
            </div>
            <select
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              className="w-full appearance-none pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none cursor-pointer focus:border-[#F3B22B] focus:ring-2 focus:ring-[#F3B22B]/20"
            >
              <option value="">Todas las comunidades</option>
              {COMMUNITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
            {records.length === 0 ? 'Todavía no hay registros.' : 'Ningún registro coincide con la búsqueda.'}
          </div>
        ) : (
          <>
            {/* Tabla en pantallas grandes */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-xs overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Folio</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold text-right">Edad</th>
                    <th className="px-4 py-3 font-semibold">Sexo</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Comunidad</th>
                    <th className="px-4 py-3 font-semibold">Registro (CDMX)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr key={r.folio} className="hover:bg-[#F3B22B]/5">
                      <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">{r.folio}</td>
                      <td className="px-4 py-3 font-medium">{r.nombre_completo}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.edad}</td>
                      <td className="px-4 py-3">{r.sexo}</td>
                      <td className="px-4 py-3 font-mono whitespace-nowrap">
                        <a href={`tel:${r.telefono.replace(/[^\d+]/g, '')}`} className="hover:text-[#B7841A] hover:underline">
                          {r.telefono}
                        </a>
                      </td>
                      <td className="px-4 py-3">{r.comunidad || <span className="text-gray-400">—</span>}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap tabular-nums">{r.registrado_cdmx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas en celular */}
            <ul className="md:hidden space-y-2">
              {filtered.map((r) => (
                <li key={r.folio} className="bg-white rounded-xl border border-gray-100 shadow-xs p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm break-words">{r.nombre_completo}</p>
                    <span className="font-mono text-xs font-semibold text-gray-500 shrink-0">{r.folio}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {r.edad} años · {r.sexo}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 break-words">{r.comunidad || '—'}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <a href={`tel:${r.telefono.replace(/[^\d+]/g, '')}`} className="font-mono text-xs font-semibold">
                      {r.telefono}
                    </a>
                    <span className="text-[11px] text-gray-400 tabular-nums">{r.registrado_cdmx}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};
