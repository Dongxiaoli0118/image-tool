import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Image as ImageIcon, Sparkles, Scissors, MonitorPlay, Crop } from 'lucide-react';
import { ID_PRESETS } from './constants';
import { IDPreset, ResizeMode } from './types';
import { readFileAsDataURL, processImage, loadImage } from './utils/imageUtils';
import { analyzeIDPhoto } from './services/geminiService';
import { AnalysisModal } from './components/AnalysisModal';

const App: React.FC = () => {
  // State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState<number | string>('');
  const [targetHeight, setTargetHeight] = useState<number | string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // AI Modal State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);
        setOriginalImage(dataUrl);
        setCurrentImage(dataUrl);
        setDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        setAnalysisResult(null); // Clear previous analysis
      } catch (error) {
        console.error("Error loading image:", error);
        alert("Failed to load image");
      } finally {
        // Reset input so the same file can be selected again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        try {
          const dataUrl = await readFileAsDataURL(file);
          const img = await loadImage(dataUrl);
          setOriginalImage(dataUrl);
          setCurrentImage(dataUrl);
          setDimensions({ width: img.width, height: img.height });
          setTargetWidth(img.width);
          setTargetHeight(img.height);
          setAnalysisResult(null);
        } catch (error) {
          console.error("Error loading dropped image:", error);
        }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const applyResize = async (w: number, h: number, mode: ResizeMode) => {
    if (!originalImage) return;
    setIsProcessing(true);
    try {
      // Always resize from original to prevent quality degradation from repeated saves
      const processed = await processImage(originalImage, w, h, mode);
      setCurrentImage(processed);
      setDimensions({ width: w, height: h });
      // Update inputs to match
      setTargetWidth(w);
      setTargetHeight(h);
    } catch (error) {
      console.error("Resize failed", error);
      alert("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetClick = (preset: IDPreset) => {
    applyResize(preset.width, preset.height, ResizeMode.CROP_CENTER);
  };

  const handleCustomResize = () => {
    const w = Number(targetWidth);
    const h = Number(targetHeight);
    if (w > 0 && h > 0) {
      applyResize(w, h, ResizeMode.STRETCH); // Default to stretch/scale for custom
    } else {
        alert("Please enter valid dimensions");
    }
  };

  const handleReset = async () => {
    if (originalImage) {
        const img = await loadImage(originalImage);
        setCurrentImage(originalImage);
        setDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `pixelperfect-id-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAIAnalysis = async () => {
    if (!currentImage) return;
    setIsAnalysisOpen(true);
    if (!analysisResult) {
        setIsAnalyzing(true);
        const result = await analyzeIDPhoto(currentImage);
        setAnalysisResult(result);
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <AnalysisModal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)}
        isLoading={isAnalyzing}
        result={analysisResult}
      />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Crop className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              PixelPerfect ID
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Optional Header Links */}
             <span className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 hidden sm:inline-block">
                Beta v1.0
             </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Image Preview / Upload */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div 
              className={`flex-1 min-h-[500px] bg-white rounded-2xl shadow-sm border-2 border-dashed relative overflow-hidden transition-all duration-300 group
                ${!currentImage ? 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50' : 'border-transparent bg-gray-900'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!currentImage ? (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8 text-center"
                  onClick={triggerUpload}
                >
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload your photo</h3>
                  <p className="text-gray-500 max-w-md">
                    Drag and drop or click to upload. Supports JPG, PNG, WEBP up to 10MB.
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                   {/* Checkerboard background for transparency */}
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                   
                   <img 
                      src={currentImage} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain shadow-2xl"
                      style={{ 
                        maxWidth: '95%', 
                        maxHeight: '95%' 
                      }}
                   />
                   
                   {/* Image Info Overlay */}
                   <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-mono flex items-center gap-2">
                      <MonitorPlay className="w-3 h-3" />
                      {dimensions.width} x {dimensions.height} px
                   </div>

                   {/* Action Toolbar */}
                   <div className="absolute top-4 right-4 flex gap-2">
                     <button 
                       onClick={triggerUpload}
                       className="bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-medium flex items-center gap-2 hover:text-indigo-600"
                       title="Upload New Photo"
                     >
                       <Upload className="w-4 h-4" />
                       <span className="hidden sm:inline">Change</span>
                     </button>
                     <button 
                       onClick={handleReset}
                       className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-all hover:text-indigo-600"
                       title="Reset Changes"
                     >
                       <RefreshCw className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* AI Action Bar - only visible when image loaded */}
            {currentImage && (
                <div className="bg-gradient-to-r from-violet-100 to-indigo-100 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <Sparkles className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-900">AI Quality Check</h4>
                            <p className="text-sm text-indigo-700">Get instant feedback on ID photo suitability</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAIAnalysis}
                        className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all active:scale-95"
                    >
                        Analyze Photo
                    </button>
                </div>
            )}
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Custom Resize Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-gray-500" />
                  Custom Dimensions
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Width (px)</label>
                    <input 
                      type="number" 
                      value={targetWidth}
                      onChange={(e) => setTargetWidth(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                      placeholder="Width"
                      disabled={!currentImage}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Height (px)</label>
                    <input 
                      type="number" 
                      value={targetHeight}
                      onChange={(e) => setTargetHeight(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                      placeholder="Height"
                      disabled={!currentImage}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleCustomResize}
                  disabled={!currentImage || isProcessing}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                  {isProcessing ? 'Processing...' : 'Apply Resize'}
                </button>
              </div>
            </div>

            {/* Presets Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  Standard ID Sizes
                </h3>
              </div>
              <div className="p-2">
                {ID_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    disabled={!currentImage || isProcessing}
                    className="w-full flex items-center p-3 hover:bg-indigo-50 rounded-lg transition-colors group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {preset.id.includes('1') ? '1"' : '2"'}
                    </div>
                    <div className="ml-3 text-left">
                      <p className="font-medium text-gray-900 text-sm group-hover:text-indigo-700">{preset.label}</p>
                      <p className="text-xs text-gray-500">{preset.description}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{preset.width} x {preset.height} px</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-3 bg-yellow-50 text-yellow-800 text-xs border-t border-yellow-100">
                Note: Presets apply a center crop to maintain aspect ratio.
              </div>
            </div>

            {/* Download Button */}
            <button 
              onClick={handleDownload}
              disabled={!currentImage}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Photo
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;