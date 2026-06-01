import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#111827'  // Dark slate
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        Theme Color
      </label>
      
      {/* Presets Grid */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(color => {
          const isSelected = value.toUpperCase() === color.toUpperCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className="w-8 h-8 rounded-full border-2 transition-all active:scale-90"
              style={{ 
                backgroundColor: color,
                borderColor: isSelected ? '#FFFFFF' : 'transparent',
                boxShadow: isSelected ? `0 0 12px ${color}` : 'none'
              }}
              title={color}
            />
          );
        })}
      </div>

      {/* Custom HEX code input */}
      <div className="flex items-center space-x-2 w-44">
        <div className="w-8 h-8 rounded-lg border border-neutral-800" style={{ backgroundColor: value }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#HEX"
          className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
