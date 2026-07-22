import React from 'react';
import type { EpubTypographySettings } from '@/types/epub';
import { Type, AlignLeft, Minus, Plus } from 'lucide-react';

export interface EpubTypographyControlsProps {
  settings: EpubTypographySettings;
  onChange: (newSettings: EpubTypographySettings) => void;
}

export const EpubTypographyControls: React.FC<EpubTypographyControlsProps> = ({ settings, onChange }) => {
  const fontFamilies: Array<{ id: 'serif' | 'sans' | 'mono'; label: string }> = [
    { id: 'serif', label: 'Literata (Serif)' },
    { id: 'sans', label: 'Inter (Sans)' },
    { id: 'mono', label: 'Monospace' },
  ];

  const handleFontSize = (delta: number) => {
    const next = Math.min(36, Math.max(12, settings.fontSize + delta));
    onChange({ ...settings, fontSize: next });
  };

  return (
    <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-2xl p-4 shadow-xl flex flex-col gap-4 w-72 text-xs">
      <div className="flex items-center gap-2 font-bold text-[#252A27] dark:text-[#F8F5EE] border-b border-[#E8E5DD] dark:border-[#2D3630] pb-2">
        <Type className="w-4 h-4 text-[#2F6B4F] dark:text-[#3D8B67]" />
        <span>Ebook Typography Settings</span>
      </div>

      {/* Font Size */}
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-[#525B56] dark:text-[#C0C8C3]">Font Size ({settings.fontSize}px)</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFontSize(-2)}
            className="p-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#151A17] border border-[#E8E5DD] dark:border-[#2D3630] text-[#252A27] dark:text-[#F8F5EE] hover:bg-[#E8E5DD]"
            title="Decrease font size"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 bg-[#FAF8F5] dark:bg-[#151A17] rounded-lg border border-[#E8E5DD] dark:border-[#2D3630] text-center py-1 font-semibold">
            {settings.fontSize}px
          </div>
          <button
            onClick={() => handleFontSize(2)}
            className="p-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#151A17] border border-[#E8E5DD] dark:border-[#2D3630] text-[#252A27] dark:text-[#F8F5EE] hover:bg-[#E8E5DD]"
            title="Increase font size"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Font Family */}
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-[#525B56] dark:text-[#C0C8C3]">Font Family</span>
        <div className="flex flex-col gap-1">
          {fontFamilies.map((ff) => (
            <button
              key={ff.id}
              onClick={() => onChange({ ...settings, fontFamily: ff.id })}
              className={`p-2 rounded-lg text-left transition-colors font-medium ${
                settings.fontFamily === ff.id
                  ? 'bg-[#2F6B4F] text-white font-bold'
                  : 'bg-[#FAF8F5] dark:bg-[#151A17] text-[#252A27] dark:text-[#F8F5EE] border border-[#E8E5DD] dark:border-[#2D3630] hover:bg-[#E8E5DD]'
              }`}
            >
              {ff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-[#525B56] dark:text-[#C0C8C3]">Line Height ({settings.lineHeight})</span>
        <div className="flex items-center gap-1">
          {[1.2, 1.4, 1.6, 1.8, 2.0].map((lh) => (
            <button
              key={lh}
              onClick={() => onChange({ ...settings, lineHeight: lh })}
              className={`flex-1 py-1 rounded-md text-center font-semibold transition-colors ${
                settings.lineHeight === lh
                  ? 'bg-[#2F6B4F] text-white'
                  : 'bg-[#FAF8F5] dark:bg-[#151A17] text-[#525B56] dark:text-[#C0C8C3] border border-[#E8E5DD] dark:border-[#2D3630]'
              }`}
            >
              {lh}
            </button>
          ))}
        </div>
      </div>

      {/* Page Margins */}
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-[#525B56] dark:text-[#C0C8C3] flex items-center gap-1">
          <AlignLeft className="w-3.5 h-3.5" />
          Container Margins ({settings.marginPadding}px)
        </span>
        <div className="flex items-center gap-1">
          {[16, 24, 32, 48].map((pad) => (
            <button
              key={pad}
              onClick={() => onChange({ ...settings, marginPadding: pad })}
              className={`flex-1 py-1 rounded-md text-center font-semibold transition-colors ${
                settings.marginPadding === pad
                  ? 'bg-[#2F6B4F] text-white'
                  : 'bg-[#FAF8F5] dark:bg-[#151A17] text-[#525B56] dark:text-[#C0C8C3] border border-[#E8E5DD] dark:border-[#2D3630]'
              }`}
            >
              {pad}px
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
