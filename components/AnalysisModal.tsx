import React from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: string | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold">AI Photo Analysis</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500 font-medium animate-pulse">Analyzing pixel data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {result && (
                <div className="prose prose-indigo max-w-none">
                  {result.includes("✅") ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                      <span className="font-semibold">Seems good!</span>
                    </div>
                  ) : result.includes("⚠️") ? (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <span className="font-semibold">Attention needed</span>
                    </div>
                  ) : null}
                  
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {result}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};