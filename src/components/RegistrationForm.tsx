import React, { useEffect, useState, useId } from 'react';
import { User, Calendar, Phone, Users, ChevronDown, PlusCircle, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { RegistrationFormData, FormErrors, Gender } from '../types';
import { COMMUNITIES, OTHER_COMMUNITY, cleanCommunity, isValidCommunity } from '../config/communities';
import { isValidPhone } from '../config/phone';
import { fetchCommunities } from '../services/communitiesService';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isLoading }) => {
  const formId = useId();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    community: '',
  });

  const [touched, setTouched] = useState<Record<keyof RegistrationFormData, boolean>>({
    fullName: false,
    age: false,
    gender: false,
    phone: false,
    community: false,
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Nombre escrito a mano cuando la comunidad no aparece en la lista
  const [newCommunity, setNewCommunity] = useState('');
  const isOtherCommunity = formData.community === OTHER_COMMUNITY;

  // Lista de comunidades editable desde /admin (mientras carga se muestra la lista inicial)
  const [communities, setCommunities] = useState<string[]>([...COMMUNITIES]);
  useEffect(() => {
    fetchCommunities().then(setCommunities);
  }, []);

  // Real-time field validation logic
  const validate = (data: RegistrationFormData): FormErrors => {
    const errors: FormErrors = {};

    // Nombre completo: requerido, al menos 3 caracteres, alfabético con acentos y espacios
    const nameTrimmed = data.fullName.trim();
    if (!nameTrimmed) {
      errors.fullName = 'El nombre completo es obligatorio.';
    } else if (nameTrimmed.length < 3) {
      errors.fullName = 'Por favor ingresa al menos 3 caracteres.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(nameTrimmed)) {
      errors.fullName = 'Ingresa solo letras y espacios válidos.';
    }

    // Edad: requerida, número entero positivo, rango razonable (ej. 10 a 99 años)
    const ageTrimmed = data.age.trim();
    if (!ageTrimmed) {
      errors.age = 'La edad es obligatoria.';
    } else {
      const ageNum = parseInt(ageTrimmed, 10);
      if (isNaN(ageNum) || !/^\d+$/.test(ageTrimmed)) {
        errors.age = 'Ingresa una edad numérica válida.';
      } else if (ageNum < 10 || ageNum > 99) {
        errors.age = 'La edad debe estar entre 10 y 99 años.';
      }
    }

    // Sexo: requerido, Masculino o Femenino
    if (!data.gender) {
      errors.gender = 'Selecciona una opción de sexo.';
    }

    // Teléfono: requerido, 10 dígitos (se quita +52 automáticamente, ej. del autocompletado)
    const phoneTrimmed = data.phone.trim();
    if (!phoneTrimmed) {
      errors.phone = 'El teléfono es obligatorio.';
    } else if (!isValidPhone(phoneTrimmed)) {
      errors.phone = 'Ingresa un número de 10 dígitos (sin +52).';
    }

    // Comunidad: requerida; de la lista o escrita a mano si no aparece
    if (!data.community) {
      errors.community = 'Selecciona tu comunidad.';
    } else if (data.community === OTHER_COMMUNITY) {
      const typed = cleanCommunity(newCommunity);
      if (!typed) {
        errors.community = 'Escribe el nombre de tu comunidad.';
      } else if (!isValidCommunity(typed)) {
        errors.community = 'El nombre debe tener entre 3 y 100 caracteres.';
      }
    }

    return errors;
  };

  const errors = validate(formData);

  const handleBlur = (field: keyof RegistrationFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender: Gender) => {
    setFormData((prev) => ({ ...prev, gender }));
    setTouched((prev) => ({ ...prev, gender: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      fullName: true,
      age: true,
      gender: true,
      phone: true,
      community: true,
    });

    const currentErrors = validate(formData);
    if (Object.keys(currentErrors).length === 0) {
      await onSubmit(
        isOtherCommunity ? { ...formData, community: cleanCommunity(newCommunity) } : formData
      );
    }
  };

  const isFieldInvalid = (field: keyof RegistrationFormData) => {
    return (touched[field] || submitAttempted) && Boolean(errors[field]);
  };

  const isFieldValid = (field: keyof RegistrationFormData) => {
    return (touched[field] || submitAttempted) && !errors[field] && Boolean(formData[field]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 border border-gray-100 p-4 sm:p-8 md:p-10 transition-all">
      <form id={`form-${formId}`} onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6">
        
        {/* Campo: Nombre Completo */}
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <label
              htmlFor={`fullName-${formId}`}
              className="block text-xs sm:text-sm font-semibold text-[#222222]"
            >
              Nombre completo <span className="text-[#F3B22B]">*</span>
            </label>
            {isFieldValid('fullName') && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-medium animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              id={`fullName-${formId}`}
              type="text"
              name="fullName"
              autoComplete="name"
              disabled={isLoading}
              placeholder="Ej. Juan Carlos Pérez Rodríguez"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border bg-gray-50/50 transition-all duration-200 outline-none text-[#222222] placeholder-gray-400 ${
                isFieldInvalid('fullName')
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-gray-200 focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20'
              }`}
            />
          </div>
          {isFieldInvalid('fullName') && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Fila: Edad y Sexo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Campo: Edad */}
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label
                htmlFor={`age-${formId}`}
                className="block text-xs sm:text-sm font-semibold text-[#222222]"
              >
                Edad <span className="text-[#F3B22B]">*</span>
              </label>
              {isFieldValid('age') && (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                id={`age-${formId}`}
                type="number"
                name="age"
                inputMode="numeric"
                min="10"
                max="99"
                disabled={isLoading}
                placeholder="Ej. 18"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                onBlur={() => handleBlur('age')}
                className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border bg-gray-50/50 transition-all duration-200 outline-none text-[#222222] placeholder-gray-400 ${
                  isFieldInvalid('age')
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-gray-200 focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20'
                }`}
              />
            </div>
            {isFieldInvalid('age') ? (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.age}
              </p>
            ) : (
              <p className="mt-1 text-[11px] sm:text-xs text-gray-400">Edad en años cumplidos</p>
            )}
          </div>

          {/* Campo: Sexo */}
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#222222]">
                Sexo <span className="text-[#F3B22B]">*</span>
              </label>
              {isFieldValid('gender') && (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3" role="group" aria-label="Selección de sexo">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGenderSelect('Masculino')}
                className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] ${
                  formData.gender === 'Masculino'
                    ? 'border-[#F3B22B] bg-[#F3B22B]/10 text-[#222222] font-semibold shadow-xs ring-1 ring-[#F3B22B]'
                    : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-white'
                }`}
              >
                <span>Masculino</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGenderSelect('Femenino')}
                className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] ${
                  formData.gender === 'Femenino'
                    ? 'border-[#F3B22B] bg-[#F3B22B]/10 text-[#222222] font-semibold shadow-xs ring-1 ring-[#F3B22B]'
                    : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-white'
                }`}
              >
                <span>Femenino</span>
              </button>
            </div>
            {isFieldInvalid('gender') && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.gender}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Teléfono */}
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <label
              htmlFor={`phone-${formId}`}
              className="block text-xs sm:text-sm font-semibold text-[#222222]"
            >
              Teléfono (WhatsApp o Móvil) <span className="text-[#F3B22B]">*</span>
            </label>
            {isFieldValid('phone') && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              id={`phone-${formId}`}
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              disabled={isLoading}
              placeholder="Ej. 871 133 3316"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border bg-gray-50/50 transition-all duration-200 outline-none text-[#222222] placeholder-gray-400 ${
                isFieldInvalid('phone')
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-gray-200 focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20'
              }`}
            />
          </div>
          {isFieldInvalid('phone') ? (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.phone}
            </p>
          ) : (
            <p className="mt-1 text-[11px] sm:text-xs text-gray-400">
              Número a 10 dígitos para avisos y recordatorios
            </p>
          )}
        </div>

        {/* Campo: Comunidad */}
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <label
              htmlFor={`community-${formId}`}
              className="block text-xs sm:text-sm font-semibold text-[#222222]"
            >
              Comunidad <span className="text-[#F3B22B]">*</span>
            </label>
            {isFieldValid('community') && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <select
              id={`community-${formId}`}
              name="community"
              disabled={isLoading}
              value={formData.community}
              onChange={(e) => {
                handleChange('community', e.target.value);
                handleBlur('community');
              }}
              onBlur={() => handleBlur('community')}
              className={`w-full appearance-none pl-10 sm:pl-11 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border bg-gray-50/50 transition-all duration-200 outline-none cursor-pointer ${
                formData.community ? 'text-[#222222]' : 'text-gray-400'
              } ${
                isFieldInvalid('community')
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-gray-200 focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20'
              }`}
            >
              <option value="" disabled>
                Selecciona tu comunidad
              </option>
              {communities.map((community) => (
                <option key={community} value={community} className="text-[#222222]">
                  {community}
                </option>
              ))}
              <option value={OTHER_COMMUNITY} className="text-[#222222]">
                Mi comunidad no aparece (nueva comunidad)
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          {isOtherCommunity && (
            <div className="relative mt-2 animate-fadeIn">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-gray-400">
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                id={`newCommunity-${formId}`}
                type="text"
                name="newCommunity"
                autoFocus
                maxLength={100}
                disabled={isLoading}
                aria-label="Nombre de la nueva comunidad"
                placeholder="Escribe el nombre de tu comunidad"
                value={newCommunity}
                onChange={(e) => setNewCommunity(e.target.value)}
                onBlur={() => handleBlur('community')}
                className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border bg-gray-50/50 transition-all duration-200 outline-none text-[#222222] placeholder-gray-400 ${
                  isFieldInvalid('community')
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-gray-200 focus:border-[#F3B22B] focus:bg-white focus:ring-2 focus:ring-[#F3B22B]/20'
                }`}
              />
            </div>
          )}
          {isFieldInvalid('community') && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.community}
            </p>
          )}
        </div>

        {/* Botón de Enviar */}
        <button
          id="btn-submit-registration"
          type="submit"
          disabled={isLoading}
          className="w-full relative flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base bg-[#F3B22B] hover:bg-[#E5A51F] active:scale-[0.99] text-[#222222] shadow-md shadow-[#F3B22B]/20 transition-all duration-200 cursor-pointer min-h-[48px] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Guardando Registro...</span>
            </>
          ) : (
            <>
              <span>Registrarme ahora</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

      </form>
    </div>
  );
};
