import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithRedirect } from 'firebase/auth';

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      // Use signInWithRedirect for both Mobile and Web to avoid COOP/COEP issues on GitHub Pages
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Erro ao fazer login com Google. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-orange-600 mb-6">Horímetro Cambuí</h1>
        
        <p className="text-gray-600 mb-8">
          Faça login para acessar o sistema.
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded shadow-sm hover:bg-gray-50 transition-colors"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google G Logo" 
            className="w-6 h-6" 
          />
          Entrar com Google
        </button>

        <p className="text-xs text-gray-500 mt-6">
          Acesso restrito a usuários autorizados.
        </p>
      </div>
    </div>
  );
};
