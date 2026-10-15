import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SummaryBoxProps {
  duration: number;
  totalSavedKB: number;
  avgReduction: number;
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({ duration, totalSavedKB, avgReduction }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-malibu/10 border border-anakiwa/20 rounded-3xl p-8 mt-10"
    >
      <div className="flex items-center gap-3 mb-6 text-fog">
        <Sparkles className="w-6 h-6" />
        <h3 className="text-xl font-bold">İşlem Tamamlandı!</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl border border-anakiwa/20">
          <p className="text-sm text-fog font-medium">İşlem Süresi</p>
          <p className="text-2xl font-bold text-fog">{duration.toFixed(2)}s</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-anakiwa/20">
          <p className="text-sm text-fog font-medium">Toplam Tasarruf</p>
          <p className="text-2xl font-bold text-fog">{totalSavedKB.toFixed(2)} KB</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-anakiwa/20">
          <p className="text-sm text-fog font-medium">Ort. İyileştirme</p>
          <p className="text-2xl font-bold text-fog">{avgReduction.toFixed(1)}%</p>
        </div>
      </div>
    </motion.div>
  );
};
