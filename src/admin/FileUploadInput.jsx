import { useState, useRef } from 'react';

export default function FileUploadInput({
  label,
  accept,
  value,
  previewUrl,
  onChange,
  onClear,
  type = 'image',
  required = false,
  emoji = null,
  previewClassName = 'rounded-full',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // Create local preview
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (type === 'audio') {
      setLocalPreview(URL.createObjectURL(file));
    }

    onChange(file);
  };

  const handleClear = () => {
    setLocalPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear?.();
  };

  const displayPreview = localPreview || previewUrl;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Current value display */}
      {value && !localPreview && (
        <p className="text-xs text-gray-500 truncate">Current: {value}</p>
      )}

      {/* Preview area */}
      {displayPreview ? (
        <div className="relative inline-block">
          {type === 'image' ? (
            <img
              src={displayPreview}
              alt="Preview"
              className={`w-24 h-24 object-cover ${previewClassName}`}
            />
          ) : type === 'audio' ? (
            <audio
              src={displayPreview}
              controls
              className="w-full max-w-xs"
            />
          ) : null}
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : emoji && type === 'image' ? (
        <div className="w-24 h-24 flex items-center justify-center">
          <span className="text-5xl">{emoji}</span>
        </div>
      ) : null}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">
            Drop {type === 'image' ? 'image' : 'audio file'} here or click to browse
          </p>
          <p className="text-xs text-gray-400">
            {type === 'image' ? 'PNG, JPG, WebP, or SVG' : 'MP3, WAV, or OGG'}
          </p>
        </div>
      </div>
    </div>
  );
}
