import React, { useState } from 'react';
import { validateApiKey, setStoredApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  onSuccess: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSuccess }) => {
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleValidate = async () => {
    if (!inputKey.trim()) {
      setError("Por favor, insira uma chave.");
      return;
    }

    setIsValidating(true);
    setError(null);

    const isValid = await validateApiKey(inputKey.trim());

    if (isValid) {
      setSuccess(true);
      setStoredApiKey(inputKey.trim());
      // Small delay to show success state before closing
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setError("Chave inválida ou inativa. Verifique e tente novamente.");
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chave de Acesso API</h2>
            {success ? (
               <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Ativa</span>
            ) : (
               <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Requerida</span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-6">
            Insira a sua chave API do Google Gemini. O sistema irá validar se a chave está ativa antes de gravar.
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cole a sua Chave API aqui:
          </label>
          <div className="relative mb-6">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className={`
                w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all
                ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-green-200 bg-gray-50'}
              `}
              disabled={isValidating || success}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            onClick={handleValidate}
            disabled={isValidating || success}
            className={`
              w-full py-3 rounded-lg font-bold text-white transition-all transform duration-200
              ${success 
                ? 'bg-green-600 hover:bg-green-700 scale-105' 
                : 'bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 shadow-lg shadow-green-900/20'}
              ${(isValidating || success) ? 'cursor-default' : 'cursor-pointer'}
              ${isValidating ? 'opacity-75' : 'opacity-100'}
            `}
          >
            {success ? (
              <span className="flex items-center justify-center gap-2">
                Chave verificada e gravada!
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            ) : isValidating ? (
              'Validando...'
            ) : (
              'Validar e Entrar'
            )}
          </button>

          <div className="mt-6 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              Obter uma chave API no Google AI Studio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;