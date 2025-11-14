import React, { useState } from 'react';
import { 
  Camera,
  MessageSquare,
  Eye,
  EyeOff,
  Palette,
  Clock,
  RotateCcw,
  Zap,
  Target,
  Layers,
  Mountain,
  Waves,
  Type
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';

const PresentationToolbar: React.FC = () => {
  const { 
    slides,
    currentSlideIndex,
    presentationSettings,
    isCameraLocked,
    unlockCamera,
    updatePresentationSettings,
    captureCurrentView,
    updateSlideBackground,
    objects,
    addTextAnnotation
  } = useSceneStore();

  const currentSlide = slides[currentSlideIndex];

  const [showTerrainMenu, setShowTerrainMenu] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');

  const terrainOptions = [
    { type: 'none', name: 'No Terrain', icon: Layers, description: 'Flat ground plane' },
    { type: 'mountains', name: 'Mountains', icon: Mountain, description: 'Mountainous terrain' },
    { type: 'rocky-desert', name: 'Rocky Desert', icon: Mountain, description: 'Desert with mesas' },
    { type: 'rolling-hills', name: 'Rolling Hills', icon: Waves, description: 'Gentle hills' },
    { type: 'canyon', name: 'Canyon', icon: Mountain, description: 'Canyon landscape' }
  ] as const;

  const handleTerrainChange = (terrainType: 'none' | 'mountains' | 'rocky-desert' | 'rolling-hills' | 'canyon') => {
    if (currentSlide) {
      updateSlideBackground(currentSlide.id, terrainType);
      setShowTerrainMenu(false);
    }
  };

  const handleAddText = () => {
    if (currentSlide && textInput.trim()) {
      // Add text at a default position in front of the camera
      const defaultPosition = { x: 0, y: 2, z: -3 };
      addTextAnnotation(currentSlide.id, textInput.trim(), defaultPosition);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const presentationTools = [
    {
      icon: Camera,
      action: () => currentSlide && captureCurrentView(currentSlide.id),
      title: 'Update Slide with Current View',
      disabled: !currentSlide,
      shortcut: 'C'
    },
    {
      icon: MessageSquare,
      action: () => setShowTextInput(!showTextInput),
      title: 'Add Text',
      disabled: !currentSlide,
      shortcut: 'T',
      active: showTextInput
    },
    {
      icon: presentationSettings.showAnnotations ? Eye : EyeOff,
      action: () => updatePresentationSettings({ 
        showAnnotations: !presentationSettings.showAnnotations 
      }),
      title: presentationSettings.showAnnotations ? 'Hide Annotations' : 'Show Annotations',
      disabled: false,
      shortcut: 'H'
    },
    {
      icon: RotateCcw,
      action: () => updatePresentationSettings({ 
        autoRotate: !presentationSettings.autoRotate 
      }),
      title: presentationSettings.autoRotate ? 'Disable Auto Rotate' : 'Enable Auto Rotate',
      disabled: false,
      shortcut: 'R',
      active: presentationSettings.autoRotate
    },
    {
      icon: Layers,
      action: () => {
        if (isCameraLocked) {
          unlockCamera();
        }
      },
      title: isCameraLocked ? 'Unlock Camera (Free Movement)' : 'Camera Unlocked',
      disabled: false,
      shortcut: 'U',
      active: !isCameraLocked
    },
    {
      icon: Palette,
      action: () => setShowTerrainMenu(!showTerrainMenu),
      title: 'Slide Terrain Background',
      disabled: !currentSlide,
      shortcut: 'B',
      active: showTerrainMenu
    }
  ] as const;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-3 border border-white/5 z-10">
      {/* Text Input Menu */}
      {showTextInput && currentSlide && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-20 min-w-80">
          <div className="p-4">
            <h3 className="text-sm font-medium text-white/90 mb-3">Add Text to Slide</h3>
            <div className="space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text for this slide..."
                className="w-full bg-[#3a3a3a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50 resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddText();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddText}
                  disabled={!textInput.trim()}
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Add Text
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="text-xs text-white/60">
                Tip: Press Ctrl+Enter to add text quickly
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terrain Menu */}
      {showTerrainMenu && currentSlide && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-20 min-w-64">
          <div className="p-3 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/90">Slide Terrain</h3>
            <p className="text-xs text-white/60 mt-1">Choose a 3D terrain for this slide</p>
          </div>
          <div className="p-2">
            {terrainOptions.map(({ type, name, icon: Icon, description }) => (
              <button
                key={type}
                onClick={() => handleTerrainChange(type)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                  currentSlide.terrainType === type
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  currentSlide.terrainType === type ? 'text-blue-400' : 'text-white/70'
                }`} />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    currentSlide.terrainType === type ? 'text-blue-400' : 'text-white/90'
                  }`}>
                    {name}
                  </div>
                  <div className="text-xs text-white/60 mt-0.5">{description}</div>
                </div>
                {currentSlide.terrainType === type && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {presentationTools.map(({ icon: Icon, action, title, disabled, shortcut, active }, index) => (
          <React.Fragment key={title}>
            <button
              onClick={action}
              disabled={disabled}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                disabled
                  ? 'text-white/30 cursor-not-allowed bg-white/5'
                  : active
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:scale-105 active:scale-95'
                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
              title={`${title} ${disabled ? '(Not available)' : `(${shortcut})`}`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {title}
                {!disabled && (
                  <span className="text-white/60 ml-1">({shortcut})</span>
                )}
              </div>
            </button>
            
            {/* Separator */}
            {index < presentationTools.length - 1 && (
              <div className="w-px h-6 bg-white/10" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Current Slide Info */}
      {currentSlide && (
        <div className="mt-3 pt-3 border-t border-white/10 text-center">
          <div className="text-xs text-white/60">
            Current: <span className="text-white/90 font-medium">{currentSlide.name}</span>
            {isCameraLocked && (
              <span className="text-orange-400 ml-2">🔒</span>
            )}
          </div>
          <div className="text-xs text-white/50 mt-1">
            Camera view: {currentSlide.cameraPosition.x.toFixed(1)}, {currentSlide.cameraPosition.y.toFixed(1)}, {currentSlide.cameraPosition.z.toFixed(1)}
          </div>
              {currentSlide.terrainType && currentSlide.terrainType !== 'none' && (
                <span className="text-blue-400 ml-2">
                  • {terrainOptions.find(t => t.type === currentSlide.terrainType)?.name}
                </span>
              )}
          {isCameraLocked && (
            <div className="text-xs text-orange-400 mt-1">
              Camera locked to slide view
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PresentationToolbar;