import React from 'react';

interface FooterProps {
  onOpenGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="mt-12 pb-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500 max-w-xl mx-auto px-4">
      <p className="text-gray-400">
        © {new Date().getFullYear()} RCCES Parroquia de Todos los Santos • Registro de Nuevos Integrantes
      </p>
    </footer>
  );
};

