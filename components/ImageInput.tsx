import React, { useRef } from 'react';
import { ImageFile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageInputProps {
  label: string;
  image: ImageFile | null;
  onImageSelected: (file: ImageFile) => void;
  onRemove: () => void;
  required?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ label, image, onImageSelected, onRemove, required }) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Função auxiliar para converter imagens para PNG
  const convertImageToPNG = (file: File): Promise<{ preview: string; base64: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Criar canvas para conversão
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }
          
          // Desenhar imagem no canvas
          ctx.drawImage(img, 0, 0);
          
          // Converter para PNG
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao converter imagem'));
              return;
            }
            
            const pngReader = new FileReader();
            pngReader.onload = (event) => {
              const result = event.target?.result as string;
              const base64 = result.split(',')[1];
              
              resolve({
                preview: result,
                base64: base64
              });
            };
            pngReader.onerror = reject;
            pngReader.readAsDataURL(blob);
          }, 'image/png', 0.95); // PNG com qualidade 95%
        };
        
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    // Lista de formatos que precisam ser convertidos
    const needsConversion = ['image/avif', 'image/webp', 'image/jxl', 'image/heic', 'image/heif'];
    
    if (needsConversion.includes(file.type)) {
      // Converter para PNG
      try {
        const convertedData = await convertImageToPNG(file);
        onImageSelected({
          file,
          preview: convertedData.preview,
          base64: convertedData.base64,
          mimeType: 'image/png' // Sempre PNG após conversão
        });
      } catch (error) {
        console.error('Erro ao converter imagem:', error);
        alert(t.imageConversionError);
      }
    } else {
      // Formatos já suportados (JPEG, PNG)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];

        onImageSelected({
          file,
          preview: result,
          base64,
          mimeType
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert(t.imageConversionError);
      return;
    }

    await processFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      
      <div 
        className={`
          relative w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all duration-300
          ${image 
            ? 'border-pink-500 bg-white dark:bg-neutral-800' 
            : isDragging
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 scale-105'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 dark:border-neutral-600 dark:hover:border-neutral-400 dark:bg-neutral-800/50 dark:hover:bg-neutral-800'}
          flex items-center justify-center overflow-hidden
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {image ? (
          <>
            <img 
              src={image.preview} 
              alt={label} 
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                if(inputRef.current) inputRef.current.value = '';
              }}
              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </>
        ) : (
          <div 
            className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 text-center"
            onClick={() => inputRef.current?.click()}
          >
            {isDragging ? (
              <>
                <svg className="w-10 h-10 text-pink-500 dark:text-pink-400 mb-2 animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium text-pink-600 dark:text-pink-400">{t.dropImageHere}</span>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-400 dark:text-neutral-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-neutral-400">{t.clickToAdd}</span>
              </>
            )}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/jxl,image/heic,image/heif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageInput;