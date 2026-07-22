import React from 'react';
import { ShieldCheck, WifiOff, FileText, Sparkles } from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { Badge } from '../common/Badge';

export const WelcomeScreen: React.FC = () => {
  const { importDocument, isUploading, uploadProgressMessage } = useDocumentStore();

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 px-4 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Brand Icon SVG */}
      <div className="w-20 h-20 mb-6 drop-shadow-md transition-transform hover:scale-105">
        <img src="/favicon.svg" alt="Folira Logo" className="w-full h-full object-contain" />
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col items-center gap-1.5 mb-4">
        <span className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#252A27] dark:text-[#F8F5EE]">
          Folira
        </span>
        <Badge variant="forest" className="text-xs uppercase tracking-widest px-3 py-1 font-semibold">
          Read anything. Even offline.
        </Badge>
      </div>

      {/* Main Editorial Headline */}
      <h1 className="mt-2 font-editorial text-2xl sm:text-3xl font-semibold text-[#2F6B4F] dark:text-[#3D8B67] max-w-xl">
        Your reading space, wherever you are.
      </h1>

      {/* Product Explanation */}
      <p className="mt-4 text-sm sm:text-base text-[#525B56] dark:text-[#C0C8C3] max-w-xl leading-relaxed">
        Keep your PDFs organised, continue where you stopped, and read without depending on an internet connection.
      </p>

      {/* Dropzone Upload Section */}
      <div className="mt-8 w-full max-w-2xl">
        <Dropzone
          onFileSelect={importDocument}
          isUploading={isUploading}
          progressMessage={uploadProgressMessage}
        />
      </div>

      {/* Stylized Document Library Preview Illustration */}
      <div className="mt-10 p-6 w-full max-w-2xl bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-2xl shadow-sm text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-[#2F6B4F]">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2F6B4F] dark:text-[#3D8B67] uppercase tracking-wider mb-3">
          <FileText className="w-4 h-4" />
          <span>Supported Formats & Storage</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#525B56] dark:text-[#C0C8C3]">
          <div className="p-3 bg-[#F8F5EE] dark:bg-[#252A27] rounded-xl border border-[#E8E5DD] dark:border-[#2D3630]">
            <span className="font-semibold text-[#252A27] dark:text-[#F8F5EE] block mb-0.5">PDF Documents</span>
            <span>Standard PDF books, research papers, reports & guides</span>
          </div>
          <div className="p-3 bg-[#F8F5EE] dark:bg-[#252A27] rounded-xl border border-[#E8E5DD] dark:border-[#2D3630]">
            <span className="font-semibold text-[#252A27] dark:text-[#F8F5EE] block mb-0.5">100% Device Local</span>
            <span>Files remain on this device inside browser storage</span>
          </div>
          <div className="p-3 bg-[#F8F5EE] dark:bg-[#252A27] rounded-xl border border-[#E8E5DD] dark:border-[#2D3630]">
            <span className="font-semibold text-[#252A27] dark:text-[#F8F5EE] block mb-0.5">Offline Ready</span>
            <span>Works anytime without internet connection</span>
          </div>
        </div>
      </div>

      {/* Privacy & Offline Badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7A857F] dark:text-[#8E9992]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2F6B4F] dark:text-[#3D8B67]" />
          <span>Your documents remain on this device.</span>
        </div>
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-[#2F6B4F] dark:text-[#3D8B67]" />
          <span>Available completely offline.</span>
        </div>
      </div>
    </div>
  );
};
