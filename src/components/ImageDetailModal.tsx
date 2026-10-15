import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface ImageDetailModalProps {
  selectedFile: File;
  exifData: any;
  optimizationResult: { original: number, optimized: number, optimizedBlob?: Blob } | undefined;
  onClose: () => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ selectedFile, exifData, optimizationResult, onClose }) => {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);

  useEffect(() => {
     const url = URL.createObjectURL(selectedFile);
     setOriginalUrl(url);
     return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
     if (optimizationResult?.optimizedBlob) {
         const url = URL.createObjectURL(optimizationResult.optimizedBlob);
         setOptimizedUrl(url);
         return () => URL.revokeObjectURL(url);
     }
  }, [optimizationResult?.optimizedBlob]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">{selectedFile.name}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100"><X /></button>
        </div>
        
        <div className="relative w-full h-[400px] border rounded-2xl overflow-hidden">
              {originalUrl && optimizedUrl ? (
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={originalUrl} alt="Original" />}
                  itemTwo={<ReactCompareSliderImage src={optimizedUrl} alt="Optimized" />}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-80 flex items-center justify-center border rounded-xl bg-zinc-50 text-zinc-400">Processing...</div>
              )}
            </div>

        <div className="mt-6 text-sm grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <p><strong>Boyut:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                <p><strong>MIME Tipi:</strong> {selectedFile.type}</p>
                {exifData && Object.entries(exifData).map(([key, value]) => (
                    <p key={key} className="truncate"><strong>{key}:</strong> {String(value)}</p>
                ))}
            </div>
            {optimizationResult && (
              <div className="p-4 bg-zinc-50 rounded-lg">
                <p><strong>Optimize Sonucu:</strong></p>
                <p>Orijinal: {(optimizationResult.original / 1024).toFixed(2)} KB</p>
                <p>Yeni: {(optimizationResult.optimized / 1024).toFixed(2)} KB</p>
                <p><strong>Değişim:</strong> {(((optimizationResult.optimized - optimizationResult.original) / optimizationResult.original) * 100).toFixed(1)}%</p>
              </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};
