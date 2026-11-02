import React, { useState } from 'react';

interface HeaderProps {
  onOpenGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [imgSrc, setImgSrc] = useState('/logo.png');

  const handleImageError = () => {
    // Fallback to Google Drive direct web link if local file fails
    setImgSrc('https://drive.google.com/uc?export=view&id=12ucIf9sMN8Md2dUZVyRPDQGaWeXXznce');
  };

  return (
    <header className="text-center pt-2 sm:pt-6 pb-4 sm:pb-6 px-2 max-w-2xl mx-auto">
      {/* Logo Container */}
      <div className="relative mx-auto w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-[#F3B22B]/10 rounded-full blur-xl -z-10" />
        <img
          id="church-logo-img"
          src={imgSrc}
          alt="Logotipo RCCES Parroquia de Todos los Santos"
          onError={handleImageError}
          className="max-h-full max-w-full object-contain drop-shadow-xs select-none"
          loading="eager"
        />
      </div>

      {/* Main Title */}
      <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#222222] tracking-tight uppercase mb-1.5 sm:mb-2">
        REGISTRO DE NUEVOS INTEGRANTES
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed px-1">
        ¡Bienvenido! Completa tus datos para registrarte
      </p>
    </header>
  );
};
