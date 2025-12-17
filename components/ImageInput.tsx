import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface ImageInputProps {
  label: string;
  image: ImageFile | null;
  onImageSelected: (file: ImageFile) => void;
  onRemove: () => void;
  required?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ label, image, onImageSelected, onRemove, required }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Extract pure Base64 and MimeType
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
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 dark:border-neutral-600 dark:hover:border-neutral-400 dark:bg-neutral-800/50 dark:hover:bg-neutral-800'}
          flex items-center justify-center overflow-hidden
        `}
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
            <svg className="w-8 h-8 text-gray-400 dark:text-neutral-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500 dark:text-neutral-400">Clique para adicionar</span>
          </div>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageInput;