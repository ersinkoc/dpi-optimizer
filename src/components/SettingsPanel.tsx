import React from 'react';
import { Settings2, Info } from 'lucide-react';

interface SettingsPanelProps {
  dpi: number;
  setDpi: (dpi: number) => void;
  resize: number;
  setResize: (resize: number) => void;
  quality: number;
  setQuality: (quality: number) => void;
  format: string;
  setFormat: (format: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  dpi, setDpi, resize, setResize, quality, setQuality, format, setFormat
}) => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-anakiwa/20 shadow-sm">
      <div className="flex items-center gap-3 mb-8 text-xl font-bold text-fog">
        <div className="p-2 bg-malibu/20 rounded-xl">
          <Settings2 className="w-6 h-6 text-fog" />
        </div>
        <h2>İşleme Ayarları</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-fog mb-2">Web İçin Hızlı Ayarlar</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
             <button
                onClick={() => { setDpi(72); setQuality(0.8); }}
                className="px-2 py-2 bg-malibu/10 text-fog rounded-xl text-xs font-semibold hover:bg-malibu/20 border border-anakiwa/20"
             >
                72 DPI / 0.8
             </button>
             <button
                onClick={() => { setDpi(144); setQuality(0.8); }}
                className="px-2 py-2 bg-malibu/10 text-fog rounded-xl text-xs font-semibold hover:bg-malibu/20 border border-anakiwa/20"
             >
                144 DPI / 0.8
             </button>
             <button
                onClick={() => { setDpi(216); setQuality(0.8); }}
                className="px-2 py-2 bg-malibu/10 text-fog rounded-xl text-xs font-semibold hover:bg-malibu/20 border border-anakiwa/20"
             >
                216 DPI / 0.8
             </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-fog mb-2">Maksimum Boyut (Yeniden Boyutlandırma)</label>
          <select
            value={resize}
            onChange={(e) => setResize(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-anakiwa/20 rounded-2xl focus:ring-2 focus:ring-fog outline-none"
          >
            <option value="0">Orijinal Boyut</option>
            <option value="1000">1000px</option>
            <option value="2000">2000px</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-fog mb-2">Görsel Formatı</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-anakiwa/20 rounded-2xl focus:ring-2 focus:ring-fog outline-none"
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
            <option value="image/gif">GIF (Animated)</option>
          </select>
        </div>
        
        {format === 'image/gif' && (
          <div className="p-4 bg-azure-radiance/10 text-azure-radiance rounded-2xl text-xs">
            GIF dosyaları hareketli yapısını korumak adına sıkıştırılmadan orijinal haliyle bırakılmaktadır.
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-fog mb-2 flex items-center justify-between">
            Hedef DPI 
            <Info className="w-4 h-4 text-anakiwa" title="DPI, baskı kalitesini belirler. Yüksek DPI küçük basılır ve daha nettir, düşük DPI büyük basılır ancak kalite düşebilir." />
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[72, 96, 150, 200, 300, 600].map(preset => (
              <button 
                key={preset}
                onClick={() => setDpi(preset)}
                className={`px-3 py-2 text-sm rounded-xl border transition-all ${dpi === preset ? 'bg-fog text-white border-fog' : 'bg-white hover:bg-malibu/10 border-anakiwa/20'}`}
              >
                {preset} DPI
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="1200"
            value={dpi}
            onChange={(e) => setDpi(parseInt(e.target.value) || 72)}
            className="w-full px-4 py-3 bg-white border border-anakiwa/20 rounded-2xl focus:ring-2 focus:ring-fog outline-none mt-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-fog mb-2">Kalite ({ (quality * 100).toFixed(0) }%)</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full h-2 bg-malibu/20 rounded-lg appearance-none cursor-pointer accent-fog"
          />
        </div>
      </div>
    </div>
  );
};
