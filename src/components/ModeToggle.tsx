import React from 'react';
import { Monitor, Presentation, Palette, Wrench } from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';

const ModeToggle: React.FC = () => {
  const { applicationMode, setApplicationMode } = useSceneStore();

  const modes = [
    {
      id: 'modeling',
      name: 'Modeling',
      icon: Wrench,
      description: '3D modeling and editing tools'
    },
    {
      id: 'presentation',
      name: 'Presentation',
      icon: Presentation,
      description: 'Create and manage presentation slides'
    }
  ] as const;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 z-50">
      <div className="flex items-center p-2 gap-1">
        {modes.map(({ id, name, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setApplicationMode(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              applicationMode === id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-white/70 hover:text-white/90 hover:bg-white/5'
            }`}
            title={description}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeToggle;