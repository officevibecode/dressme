import React, { useState, useEffect } from 'react';
import ImageInput from './components/ImageInput';
import { ImageFile } from './types';
import { generateFashionLook, editBackground, generateFashionVideo, checkApiKeySelection, promptApiKeySelection, getStoredApiKey, removeStoredApiKey, validateApiKey, setStoredApiKey } from './services/geminiService';

declare global {
  // Augment the existing AIStudio interface to include the required methods.
  // This prevents conflict with the global window.aistudio declaration.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Auth State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>("");
  const [isKeyValidating, setIsKeyValidating] = useState<boolean>(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Inputs
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [topImage, setTopImage] = useState<ImageFile | null>(null);
  const [bottomImage, setBottomImage] = useState<ImageFile | null>(null);

  // Outputs & State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Checks
  const canGenerate = modelImage && (topImage || bottomImage);
  const canGenerateVideo = !!generatedImageUrl;

  // Initialize Theme and Check Key
  useEffect(() => {
    // Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check API Key
    const key = getStoredApiKey();
    if (key) {
      setHasApiKey(true);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleKeyValidation = async () => {
    if (!tempKey.trim()) {
      setKeyError("Por favor, insira uma chave.");
      return;
    }

    setIsKeyValidating(true);
    setKeyError(null);

    const isValid = await validateApiKey(tempKey.trim());

    if (isValid) {
      setStoredApiKey(tempKey.trim());
      setHasApiKey(true);
      setTempKey(""); // Clear input
    } else {
      setKeyError("Chave inválida ou inativa. Verifique e tente novamente.");
    }
    setIsKeyValidating(false);
  };

  const handleLogout = () => {
    removeStoredApiKey();
    setHasApiKey(false);
    setModelImage(null);
    setTopImage(null);
    setBottomImage(null);
    setGeneratedImageUrl(null);
    setGeneratedVideoUrl(null);
  };

  const handleGenerateLook = async () => {
    if (!modelImage) return;
    
    setLoading(true);
    setLoadingStep("Criando seu look com Gemini 3 Pro...");
    setError(null);
    setGeneratedVideoUrl(null); // Reset video if regenerating look

    try {
      // 2. Generate Image
      const resultImage = await generateFashionLook(modelImage, topImage, bottomImage);
      setGeneratedImageUrl(resultImage);

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("403")) {
          setError("Chave de API inválida ou sem permissão. Tente sair e colocar outra chave.");
      } else {
          setError(err.message || "Ocorreu um erro ao gerar o look.");
      }
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleEditBackground = async () => {
    if (!generatedImageUrl || !prompt.trim()) return;

    setLoading(true);
    setLoadingStep("Atualizando o ambiente...");
    setError(null);

    try {
        const base64Data = generatedImageUrl.split(',')[1];
        const resultImage = await editBackground(base64Data, prompt);
        setGeneratedImageUrl(resultImage);
        setGeneratedVideoUrl(null); // Reset video if image changes
        setPrompt(""); // Clear prompt
    } catch (err: any) {
        setError(err.message || "Erro ao editar fundo.");
    } finally {
        setLoading(false);
        setLoadingStep("");
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedImageUrl) return;

    setLoading(true);
    setLoadingStep("Gerando vídeo com Veo (isso pode levar alguns minutos)...");
    setError(null);

    try {
      // For Veo in this custom app flow, we use the stored key manually 
      // instead of promptApiKeySelection() which is for specific demos.
      const base64Data = generatedImageUrl.split(',')[1];
      const videoUrl = await generateFashionVideo(base64Data);
      setGeneratedVideoUrl(videoUrl);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao gerar vídeo. Verifique se sua chave tem acesso ao Veo e faturamento ativado.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300 relative">
      
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
        <div>
          <img 
            src="/dressme.png" 
            alt="DressMe Logo" 
            className="mb-1"
          />
          <p className="text-gray-600 dark:text-neutral-400 text-sm">
            Misture peças, crie looks e dê vida a eles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasApiKey && (
            <button 
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-700 underline mr-2"
            >
              Trocar Chave
            </button>
          )}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-600 dark:text-neutral-400"
            title={theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
          </button>
          <div className="text-xs text-gray-500 dark:text-neutral-500 border border-gray-300 dark:border-neutral-700 rounded-full px-3 py-1">
            Powered by TGOO
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs OR Login */}
        <div className="lg:col-span-4 space-y-6">
          
          {!hasApiKey ? (
            // --- API KEY LOGIN STATE ---
            <div className="bg-white dark:bg-neutral-800/40 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm dark:shadow-none backdrop-blur-sm transition-colors duration-300">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acesso ao Sistema</h2>
                  <span className="bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 text-xs font-bold px-3 py-1 rounded-full">Requerido</span>
               </div>
               
               <p className="text-gray-600 dark:text-neutral-400 text-sm mb-6">
                  Insira a sua chave API do Google Gemini para ativar o DressMe.
               </p>

               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Sua Chave API:
                 </label>
                 <input
                   type="password"
                   value={tempKey}
                   onChange={(e) => setTempKey(e.target.value)}
                   placeholder="AIzaSy..."
                   className={`
                     w-full border rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-neutral-900 focus:outline-none focus:ring-2 transition-all
                     ${keyError 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-neutral-600 focus:ring-green-200 bg-gray-50 dark:bg-neutral-900'}
                   `}
                   disabled={isKeyValidating}
                 />
               </div>

               {keyError && (
                 <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                   {keyError}
                 </p>
               )}

               <button
                 onClick={handleKeyValidation}
                 disabled={isKeyValidating}
                 className={`
                   w-full py-3 rounded-lg font-bold text-white transition-all transform duration-200
                   ${isKeyValidating 
                     ? 'bg-green-600/70 cursor-wait' 
                     : 'bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 shadow-lg shadow-green-900/20'}
                 `}
               >
                 {isKeyValidating ? 'Validando...' : 'Validar e Entrar'}
               </button>

               <div className="mt-6 text-center">
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                 >
                   Obter chave API no Google AI Studio
                 </a>
               </div>
            </div>
          ) : (
            // --- IMAGE INPUTS STATE ---
            <div className="bg-white dark:bg-neutral-800/40 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm dark:shadow-none backdrop-blur-sm transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Selecione as Fotos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <ImageInput 
                    label="Foto da Modelo" 
                    image={modelImage} 
                    onImageSelected={setModelImage} 
                    onRemove={() => setModelImage(null)}
                    required
                  />
                </div>
                <ImageInput 
                  label="Peça de Cima" 
                  image={topImage} 
                  onImageSelected={setTopImage} 
                  onRemove={() => setTopImage(null)}
                />
                <ImageInput 
                  label="Peça de Baixo" 
                  image={bottomImage} 
                  onImageSelected={setBottomImage} 
                  onRemove={() => setBottomImage(null)}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGenerateLook}
                  disabled={!canGenerate || loading}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all
                    ${!canGenerate || loading 
                      ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-900/20 hover:shadow-pink-900/40 transform hover:-translate-y-0.5'}
                  `}
                >
                  {loading ? 'Processando...' : 'GERAR LOOK ✨'}
                </button>
                {!canGenerate && (
                  <p className="text-xs text-center mt-2 text-gray-400 dark:text-neutral-500">
                    *Modelo e pelo menos uma peça de roupa são obrigatórios.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instructions / Info */}
          <div className="bg-gray-100 dark:bg-neutral-800/20 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-300">
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">Como funciona:</h3>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Envie uma foto de corpo inteiro da modelo.</li>
              <li>Envie fotos claras das roupas (fundo liso ajuda).</li>
              <li>A IA combinará as peças na modelo.</li>
              <li>Depois, você pode alterar o cenário ou criar um vídeo.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-8 space-y-6">
           <div className={`
              bg-white dark:bg-neutral-800/40 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm dark:shadow-none min-h-[600px] flex flex-col items-center justify-center relative backdrop-blur-sm transition-all duration-300
              ${!hasApiKey ? 'opacity-50 grayscale' : ''}
           `}>
             
             {error && (
               <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-200 p-4 rounded-xl text-center z-10">
                 {error}
               </div>
             )}

             {loading && (
               <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/80 z-20 flex flex-col items-center justify-center rounded-2xl transition-colors duration-300">
                 <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-pink-600 dark:text-pink-200 animate-pulse font-medium">{loadingStep}</p>
               </div>
             )}

             {!generatedImageUrl ? (
               <div className="text-center p-12 opacity-40">
                 <div className="w-24 h-32 border-4 border-dashed border-gray-300 dark:border-neutral-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                   <span className="text-4xl">✨</span>
                 </div>
                 <p className="text-xl font-medium text-gray-800 dark:text-neutral-200">Seu look aparecerá aqui</p>
                 <p className="text-gray-500 dark:text-neutral-400">Formato 9:16 pronto para stories</p>
                 {!hasApiKey && <p className="text-xs text-red-500 mt-4 font-bold">Faça login com a API para começar</p>}
               </div>
             ) : (
               <div className="w-full flex flex-col md:flex-row gap-6 items-start justify-center">
                 
                 {/* Main Result Image */}
                 <div className="relative group max-w-sm w-full mx-auto md:mx-0">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated Look" 
                      className="w-full h-auto rounded-lg shadow-2xl shadow-black/20 dark:shadow-black/50 border border-gray-200 dark:border-neutral-700"
                    />
                    <a 
                      href={generatedImageUrl} 
                      download="look-ai.png"
                      className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Baixar Imagem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </a>
                 </div>

                 {/* Actions Panel */}
                 <div className="flex-1 w-full space-y-6">
                   
                   {/* Prompt Editor */}
                   <div className="bg-gray-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 transition-colors duration-300">
                     <label className="block text-sm font-medium text-pink-600 dark:text-pink-300 mb-2">
                       2. Alterar Ambiente / Fundo
                     </label>
                     <div className="flex gap-2">
                       <input
                         type="text"
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                         placeholder="Ex: na praia ao pôr do sol..."
                         className="flex-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-colors placeholder-gray-400 dark:placeholder-neutral-500"
                         onKeyDown={(e) => e.key === 'Enter' && handleEditBackground()}
                       />
                       <button
                         onClick={handleEditBackground}
                         disabled={!prompt.trim() || loading}
                         className="bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                       >
                         Aplicar
                       </button>
                     </div>
                   </div>

                   {/* Video Generator */}
                   <div className="bg-gray-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-purple-600 dark:text-purple-300">
                          3. Gerar Vídeo (Veo)
                        </label>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">Pago</span>
                      </div>
                      
                      {generatedVideoUrl ? (
                         <div className="relative group rounded-lg overflow-hidden border border-purple-200 dark:border-purple-500/30 shadow-lg shadow-purple-900/20">
                           <video 
                             src={generatedVideoUrl} 
                             controls 
                             autoPlay 
                             loop 
                             className="w-full aspect-[9/16] object-cover"
                           />
                           <a 
                              href={generatedVideoUrl} 
                              download="look-ai-video.mp4"
                              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-105"
                              title="Baixar Vídeo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </a>
                         </div>
                      ) : (
                        <div className="text-center">
                          <button
                            onClick={handleGenerateVideo}
                            disabled={!canGenerateVideo || loading}
                            className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 py-3 rounded-lg text-sm font-bold shadow-lg text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                            GERAR VÍDEO DO LOOK
                          </button>
                          <p className="text-[10px] text-gray-500 dark:text-neutral-500 mt-2">
                            Requer seleção de chave de API paga do Google Cloud. <br/>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-purple-600 dark:hover:text-purple-400">Saiba mais sobre faturamento.</a>
                          </p>
                        </div>
                      )}
                   </div>

                 </div>
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;