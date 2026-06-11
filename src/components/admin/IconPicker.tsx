import React from 'react';
import * as Icons from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'layers', icon: Icons.Layers },
  { name: 'newspaper', icon: Icons.Newspaper },
  { name: 'flame', icon: Icons.Flame },
  { name: 'smile', icon: Icons.Smile },
  { name: 'trophy', icon: Icons.Trophy },
  { name: 'cpu', icon: Icons.Cpu },
  { name: 'rocket', icon: Icons.Rocket },
  { name: 'briefcase', icon: Icons.Briefcase },
  { name: 'school', icon: Icons.School },
  { name: 'award', icon: Icons.Award },
  { name: 'star', icon: Icons.Star },
  { name: 'heart', icon: Icons.Heart },
  { name: 'bookmark', icon: Icons.Bookmark },
  { name: 'globe', icon: Icons.Globe },
  { name: 'message-circle', icon: Icons.MessageCircle },
  { name: 'help-circle', icon: Icons.HelpCircle }
];

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
        Section Icon
      </label>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {AVAILABLE_ICONS.map(item => {
          const IconComponent = item.icon;
          const isSelected = value === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onChange(item.name)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all active:scale-95 ${
                isSelected 
                  ? 'bg-red-600/10 border-red-500 text-red-500 shadow-lg shadow-red-950/20' 
                  : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white hover:border-gray-300 dark:border-neutral-700'
              }`}
              title={item.name}
            >
              <IconComponent size={20} />
              <span className="text-[10px] font-medium capitalize truncate max-w-full">
                {item.name.replace('-', ' ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;
