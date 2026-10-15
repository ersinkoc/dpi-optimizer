import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesDropped: (files: FileList | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, onFilesDropped, fileInputRef }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="relative">
      <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); onFilesDropped(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-white shadow-sm ${isDragging ? 'border-fog bg-malibu/10' : 'border-anakiwa hover:border-anakiwa hover:bg-malibu/10'}`}
      >
          <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
              <Upload className="w-12 h-12 text-anakiwa mb-4" />
          </motion.div>
          <p className="font-semibold text-fog">Görselleri sürükleyip bırakın</p>
          <p className="text-fog/70 text-sm">veya seçmek için tıklayın</p>
          <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif" multiple />
      </motion.div>


    </div>
  );
};
