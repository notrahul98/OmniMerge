import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { TrialBalance } from "../types";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading: boolean;
  error?: string | null;
  maxFiles?: number;
  currentFiles?: number;
}

export default function FileUpload({
  onFileSelect,
  loading,
  error,
  maxFiles = 4,
  currentFiles = 0,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".csv"))) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const isDisabled = currentFiles >= maxFiles || loading;

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDisabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-blue-300 bg-blue-50 cursor-pointer hover:border-blue-400 hover:bg-blue-100"
        }`}
      >
        <Upload className={`mx-auto mb-4 ${isDisabled ? "text-gray-400" : "text-blue-500"}`} size={32} />

        <h3 className={`font-semibold mb-2 ${isDisabled ? "text-gray-500" : "text-gray-900"}`}>
          {isDisabled ? "Maximum files reached" : "Upload Trial Balance"}
        </h3>

        <p className={`text-sm mb-3 ${isDisabled ? "text-gray-400" : "text-gray-600"}`}>
          {isDisabled
            ? `You have reached the maximum of ${maxFiles} files`
            : `Drag and drop your Excel/CSV file here, or click to browse. (${currentFiles}/${maxFiles})`}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled}
        />

        {!isDisabled && (
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Select File"}
          </button>
        )}
      </div>

      {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}
    </div>
  );
}
