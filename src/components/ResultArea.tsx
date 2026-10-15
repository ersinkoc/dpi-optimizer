import React from 'react';
import { RefreshCw, Download, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ImagePreview } from './ImagePreview';

interface ResultAreaProps {
  files: File[];
  isProcessing: boolean;
  processedCount: number;
  clearAll: () => void;
  processFiles: () => void;
  removeFile: (index: number) => void;
  openModal: (file: File) => void;
}

export const ResultArea: React.FC<ResultAreaProps> = ({
  files, isProcessing, processedCount, clearAll, processFiles, removeFile, openModal
}) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{files.length} görsel sırada</h3>
        <div className="flex gap-2">
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm text-azure-radiance bg-azure-radiance/10 rounded-full hover:bg-azure-radiance/20 transition-colors"
          >
            Tümünü Temizle
          </button>
          <button
            onClick={processFiles}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-fog text-white px-6 py-3 rounded-full font-semibold hover:bg-fog/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isProcessing ? 'İşleniyor...' : 'İşle ve ZIP Olarak İndir'}
          </button>
        </div>
      </div>
      
      {isProcessing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span className="text-fog">İşleniyor...</span>
            <span className="text-fog">{processedCount} / {files.length}</span>
          </div>
          <div className="w-full bg-malibu/20 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-fog h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(processedCount / files.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {files.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden border border-anakiwa/20 bg-white p-1 cursor-pointer"
            onClick={() => openModal(file)}
          >
            <ImagePreview file={file} />
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-bold text-fog bg-white/90 px-1.5 py-0.5 rounded-md uppercase shadow-sm">
                {file.type.split('/')[1]}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeFile(index); }}
              className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white shadow-sm"
            >
              <X className="w-4 h-4 text-fog" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
