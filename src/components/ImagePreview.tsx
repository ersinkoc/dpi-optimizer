import React, { useEffect, useState } from 'react';

export const ImagePreview: React.FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : null;
};
