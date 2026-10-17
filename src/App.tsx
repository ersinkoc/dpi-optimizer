/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as piexif from 'piexifjs';
import { FileUploader } from './components/FileUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultArea } from './components/ResultArea';
import { ImageDetailModal } from './components/ImageDetailModal';
import { SummaryBox } from './components/SummaryBox';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { LogOut } from 'lucide-react';

function ImageOptimizerApp() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  const [files, setFiles] = useState<File[]>([]);
  const [dpi, setDpi] = useState<number>(() => Number(localStorage.getItem('dpi')) || 72);
  const [resize, setResize] = useState<number>(() => Number(localStorage.getItem('resize')) || 0); 
  const [quality, setQuality] = useState<number>(() => Number(localStorage.getItem('quality')) || 0.9);
  const [format, setFormat] = useState<string>(() => localStorage.getItem('format') || 'image/jpeg');

  const adjustDPI = async (blob: Blob, dpi: number): Promise<Blob> => {
    console.log("adjustDPI called with:", dpi);
    if (format !== 'image/jpeg') return blob; // Only JPEG supports EXIF effortlessly

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          resolve(blob);
          return;
        }
        const base64 = dataUrl.split(',')[1];
        let exifObj: any;
        try {
        console.log("Loading EXIF...");
        exifObj = piexif.load(base64);
        console.log("Loaded:", exifObj);
      } catch (e) {
        console.error("EXIF load error:", e);
        exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": null };
      }
        
        console.log("EXIF loaded object:", exifObj);
        
        console.log("Setting DPI to:", dpi);
        exifObj["0th"][piexif.ImageIFD.XResolution] = [dpi, 1];
        exifObj["0th"][piexif.ImageIFD.YResolution] = [dpi, 1];
        exifObj["0th"][piexif.ImageIFD.ResolutionUnit] = 2; // 2 = inch
        
        console.log("EXIF object after setting DPI:", JSON.stringify(exifObj["0th"]));
        console.log("Dumping EXIF...");
        const exifBytes = piexif.dump(exifObj);
        
        const binary = atob(base64);
        const newBinary = piexif.insert(exifBytes, binary);
        const newBase64 = btoa(newBinary);
        
        console.log("EXIF inserted, new Base64 length:", newBase64.length);
        
        fetch("data:image/jpeg;base64," + newBase64).then(res => res.blob()).then(blob => {
            console.log("Fetch resolved, new blob size:", blob.size);
            resolve(blob);
        });
      };
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    localStorage.setItem('dpi', dpi.toString());
    localStorage.setItem('resize', resize.toString());
    localStorage.setItem('quality', quality.toString());
    localStorage.setItem('format', format);
    
    // Auto-re-optimize when settings change
    if (files.length > 0) {
      files.forEach(file => {
        optimizeFile(file, resize, format, quality).then(blob => {
          if (blob) {
            setOptimizationResults(prev => ({
              ...prev,
              [file.name]: { ...prev[file.name] || {}, optimized: blob.size, optimizedBlob: blob }
            }));
          }
        });
      });
    }
  }, [dpi, resize, quality, format, files]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<{ duration: number, totalSavedKB: number, avgReduction: number } | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [optimizationResults, setOptimizationResults] = useState<Record<string, { original: number, optimized: number, optimizedBlob?: Blob }>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const optimizeFile = async (file: File, resize: number, format: string, quality: number): Promise<Blob | null> => {
      if (file.type === 'image/gif' && format === 'image/gif') {
          return file;
      }
      return new Promise<Blob | null>((resolve) => {
        const img = new Image();
        const imageUrl = URL.createObjectURL(file);
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (resize > 0) {
              const ratio = Math.min(resize / w, resize / h);
              w *= ratio;
              h *= ratio;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
             canvas.toBlob(async (b) => {
              URL.revokeObjectURL(imageUrl);
              if (b) {
                  console.log("optimizeFile, calling adjustDPI with dpi:", dpi);
                  const adjusted = await adjustDPI(b, dpi);
                  resolve(adjusted);
              } else {
                  resolve(null);
              }
            }, format, quality);
          } else {
            URL.revokeObjectURL(imageUrl);
            resolve(null);
          }
        };
        img.src = imageUrl;
      });
  };

  const addFiles = async (files: FileList | null) => {
    const selectedFiles: File[] = Array.from(files || []).filter(file => 
      ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
    );
    if (selectedFiles.length === 0) return;
    setFiles((prev) => [...prev, ...selectedFiles]);
    
    for (const file of selectedFiles) {
        console.log("addFiles, calling optimizeFile with dpi:", dpi);
        const blob = await optimizeFile(file, resize, format, quality);
        if (blob) {
            setOptimizationResults(prev => ({
                ...prev,
                [file.name]: { original: file.size, optimized: blob.size, optimizedBlob: blob }
            }));
        }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openModal = (file: File) => {
    setSelectedFile(file);
    EXIF.getData(file as any, function(this: any) {
        setExifData(EXIF.getAllTags(this));
    });
  };

  const clearAll = () => {
    setFiles([]);
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessedCount(0);
    setOptimizationResults({});
    setSummary(null);

    const startTime = performance.now();
    let totalOriginal = 0;
    let totalOptimized = 0;

    const zip = new JSZip();

    for (const file of files) {
      totalOriginal += file.size;
      
      let blob: Blob | null = null;
      let imageUrl: string | null = null;
      
      if (file.type === 'image/gif') {
        blob = file;
      } else {
        const img = new Image();
        imageUrl = URL.createObjectURL(file);
        blob = await new Promise<Blob | null>((resolve) => {
          img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (resize > 0) {
              const ratio = Math.min(resize / w, resize / h);
              w *= ratio;
              h *= ratio;
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, w, h);
              canvas.toBlob(async (b) => {
                  if (b) {
                      console.log("processFiles, calling adjustDPI with dpi:", dpi);
                      const adjusted = await adjustDPI(b, dpi);
                      resolve(adjusted);
                  } else {
                      resolve(null);
                  }
              }, format, quality);
            } else {
              resolve(null);
            }
          };
          img.src = imageUrl;
        });
      }

      if (blob) {
        totalOptimized += blob.size;
        const ext = format.split('/')[1] === 'jpeg' ? 'jpg' : format.split('/')[1];
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        zip.file(`${baseName}.${ext}`, blob);
        setOptimizationResults(prev => ({
            ...prev,
            [file.name]: { original: file.size, optimized: blob.size, optimizedBlob: blob }
        }));
      }
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setProcessedCount((prev) => prev + 1);
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'optimized_images.zip');
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    const totalSavedKB = (totalOriginal - totalOptimized) / 1024;
    const avgReduction = totalOriginal > 0 ? ((totalOriginal - totalOptimized) / totalOriginal) * 100 : 0;
    setSummary({ duration, totalSavedKB, avgReduction });
    
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white text-fog font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
            <span>Güvenli Oturum</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer"
            title="Oturumu Kapat"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>

        <header className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-malibu/20 text-fog text-sm font-medium mb-4">
               <span>Güvenli, Toplu İşleme</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tighter mb-4 text-fog">
                Profesyonel Görsel İşleyici
            </h1>
            <p className="text-xl text-fog max-w-2xl mx-auto">
                Görsellerinizi saniyeler içinde yeniden boyutlandırın, DPI ayarlarını yapın ve optimize edin.
                Her şey doğrudan tarayıcınızda çalışır.
            </p>
        </header>

        <div className={`grid gap-8 ${files.length > 0 ? 'md:grid-cols-2' : 'max-w-xl mx-auto'}`}>
            <FileUploader onFileChange={handleFileChange} onFilesDropped={addFiles} fileInputRef={fileInputRef} />
            {files.length > 0 && (
                <SettingsPanel 
                  dpi={dpi} setDpi={setDpi}
                  resize={resize} setResize={setResize}
                  quality={quality} setQuality={setQuality}
                  format={format} setFormat={setFormat}
                />
            )}
        </div>

        {files.length > 0 && (
          <ResultArea 
            files={files}
            isProcessing={isProcessing}
            processedCount={processedCount}
            clearAll={clearAll}
            processFiles={processFiles}
            removeFile={removeFile}
            openModal={openModal}
          />
        )}
        
        {summary && (
            <SummaryBox duration={summary.duration} totalSavedKB={summary.totalSavedKB} avgReduction={summary.avgReduction} />
        )}
        
        {selectedFile && (
            <ImageDetailModal
                selectedFile={selectedFile}
                exifData={exifData}
                optimizationResult={optimizationResults[selectedFile.name]}
                onClose={() => setSelectedFile(null)}
            />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ImageOptimizerApp />
    </AuthProvider>
  );
}
