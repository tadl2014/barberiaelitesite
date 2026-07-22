import React, { useState } from 'react';
import { X, Code, Copy, Check, FileText, Folder } from 'lucide-react';
import { LARAVEL_CODEBASE } from '../data/laravelCodebase';

interface LaravelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaravelExportModal: React.FC<LaravelExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeFile = LARAVEL_CODEBASE[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#10131C] border border-[#2D281E] rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A241A] bg-[#0A0C12] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">
                Laravel Codebase Exporter
              </h3>
              <p className="text-xs text-gray-400">
                Complete Laravel Migrations, Models, BookingController, Lang files, and API Routes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar File Tree */}
          <div className="w-full md:w-72 bg-[#0E1017] border-r border-[#2A241A] p-4 overflow-y-auto shrink-0 space-y-1">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Laravel Architecture Files
            </div>

            {LARAVEL_CODEBASE.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => {
                  setActiveFileIndex(idx);
                  setCopied(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                  activeFileIndex === idx
                    ? 'bg-[#1D2230] text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{file.filename}</span>
              </button>
            ))}
          </div>

          {/* Main Code View */}
          <div className="flex-1 flex flex-col bg-[#141722] overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="p-3 bg-[#0E1017] border-b border-[#2A241A] flex items-center justify-between px-4 shrink-0">
              <span className="text-xs font-mono text-gray-300 truncate">
                {activeFile.path}
              </span>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-emerald-300/90 leading-relaxed bg-[#0B0D14]">
              <pre className="whitespace-pre-wrap font-mono">{activeFile.content}</pre>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
