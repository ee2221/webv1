import React, { useState, useRef, useEffect } from 'react';
import { 
  Presentation,
  Plus,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Camera,
  MessageSquare,
  Clock,
  Palette,
  Volume2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  X
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';

const PresentationPanel: React.FC = () => {
  const {
    slides,
    currentSlideIndex,
    isPlaying,
    presentationSettings,
    isCameraLocked,
    sceneSettings,
    updateSceneSettings,
    unlockCamera,
    addSlide,
    removeSlide,
    updateSlide,
    goToSlide,
    nextSlide,
    previousSlide,
    playPresentation,
    pausePresentation,
    stopPresentation,
    updatePresentationSettings,
    captureCurrentView,
    addAnnotation,
    removeAnnotation
  } = useSceneStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Keyboard controls for presentation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle arrow keys when in presentation mode and not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (slides.length === 0) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          previousSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case ' ': // Spacebar to play/pause
          event.preventDefault();
          if (isPlaying) {
            pausePresentation();
          } else {
            playPresentation();
          }
          break;
        case 'Escape':
          if (isPlaying) {
            event.preventDefault();
            stopPresentation();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isPlaying, nextSlide, previousSlide, playPresentation, pausePresentation, stopPresentation]);

  // Initialize position to bottom left
  useEffect(() => {
    if (panelRef.current && position.x === 0 && position.y === 0) {
      const rect = panelRef.current.getBoundingClientRect();
      const leftX = 16; // 16px from left
      const bottomY = window.innerHeight - rect.height - 16; // 16px from bottom
      setPosition({ x: leftX, y: bottomY });
    }
  }, []);

  // Handle mouse down on drag handle
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  // Handle mouse move and up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport bounds with margins
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 0) - 16;
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 0) - 16;
      
      setPosition({
        x: Math.max(16, Math.min(newX, maxX)),
        y: Math.max(16, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset]);

  const startEditing = (slideId: string, name: string) => {
    setEditingSlideId(slideId);
    setEditingName(name);
  };

  const saveEdit = () => {
    if (editingSlideId && editingName.trim()) {
      updateSlide(editingSlideId, { name: editingName.trim() });
    }
    setEditingSlideId(null);
  };

  const handleAddSlide = () => {
    // Create slide capturing the exact current camera position and angle
    addSlide(`Slide ${slides.length + 1}`);
  };

  const handlePlayPresentation = () => {
    // Hide interface when starting presentation
    playPresentation();
  };

  const handleStopPresentation = () => {
    // Show interface when stopping presentation
    stopPresentation();
  };

  const handleCaptureView = (slideId: string) => {
    captureCurrentView(slideId);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <div 
        ref={panelRef}
        className="fixed bg-[#1a1a1a] rounded-lg shadow-2xl shadow-black/20 border border-white/5 z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          className="p-3 hover:bg-white/10 rounded-lg transition-colors text-white/90 flex items-center gap-2"
          title="Expand Presentation Panel"
        >
          <Presentation className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium">Presentation ({slides.length})</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className="fixed bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 max-h-[80vh] overflow-hidden z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px'
      }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b border-white/10 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } select-none`}
        onMouseDown={handleMouseDown}
        title="Drag to move panel"
      >
        <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2 pointer-events-none">
          <Presentation className="w-5 h-5 text-purple-400" />
          Presentation
        </h2>
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/50 pointer-events-none" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70"
            title="Presentation Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(true);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70"
            title="Collapse Panel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
        {/* Playback Controls - Always visible */}
        <div className={`mb-6 p-4 bg-[#2a2a2a] rounded-lg border border-white/10 ${isPlaying ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/90">Playback Controls</h3>
            <div className="text-xs text-white/60">
              {slides.length > 0 ? `${currentSlideIndex + 1} / ${slides.length}` : '0 / 0'}
            </div>
          </div>
          
          {/* Camera Lock Status */}
          {isCameraLocked && (
            <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-xs text-orange-400 font-medium">Camera Locked to Slide</span>
                </div>
                <button
                  onClick={unlockCamera}
                  className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded text-xs text-orange-400 transition-colors"
                  title="Unlock Camera for Free Movement"
                >
                  Unlock
                </button>
              </div>
              <div className="text-xs text-white/60 mt-1">
                Camera is fixed to the current slide's viewpoint
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={previousSlide}
              disabled={slides.length === 0}
              className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:bg-[#2a2a2a] disabled:text-white/30 rounded-lg transition-colors"
              title="Previous Slide (←)"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            {isPlaying ? (
              <button
                onClick={pausePresentation}
                className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-white"
                title="Pause Presentation"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePlayPresentation}
                disabled={slides.length === 0}
                className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-[#2a2a2a] disabled:text-white/30 rounded-lg transition-colors text-white"
                title="Play Presentation (Space)"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={handleStopPresentation}
              disabled={!isPlaying}
              className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-[#2a2a2a] disabled:text-white/30 rounded-lg transition-colors text-white"
              title="Stop Presentation (Escape)"
            >
              <Square className="w-4 h-4" />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={slides.length === 0}
              className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:bg-[#2a2a2a] disabled:text-white/30 rounded-lg transition-colors"
              title="Next Slide (→)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Presentation playing...</span>
            </div>
          )}
        </div>

        {/* Playing Status - Show when presentation is playing */}
        {isPlaying && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Presentation Playing</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Playback controls are available in the top right corner
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && !isPlaying && (
          <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/90">Presentation Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Transition Duration */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">
                  Slide Transition Duration (seconds)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={presentationSettings.slideTransitionDuration}
                  onChange={(e) => updatePresentationSettings({ 
                    slideTransitionDuration: parseFloat(e.target.value) 
                  })}
                  className="w-full h-2 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-white/60 mt-1">
                  {presentationSettings.slideTransitionDuration}s
                </div>
              </div>

              {/* Auto Rotate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/90">Auto Rotate Camera</span>
                </div>
                <button
                  onClick={() => updatePresentationSettings({ 
                    autoRotate: !presentationSettings.autoRotate 
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    presentationSettings.autoRotate ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      presentationSettings.autoRotate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Annotations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/90">Show Annotations</span>
                </div>
                <button
                  onClick={() => updatePresentationSettings({ 
                    showAnnotations: !presentationSettings.showAnnotations 
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    presentationSettings.showAnnotations ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      presentationSettings.showAnnotations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slides List */}
        <div className={`space-y-2 ${isPlaying ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/90">Slides ({slides.length})</h3>
            <button
              onClick={handleAddSlide}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-medium transition-colors"
              title="Add New Slide"
            >
              <Plus className="w-3 h-3" />
              Add Slide
            </button>
          </div>

          {slides.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <Presentation className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No slides created</p>
              <p className="text-xs mt-1">Add slides to create your presentation</p>
            </div>
          ) : (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentSlideIndex === index
                    ? 'bg-blue-500/20 border-blue-500/30'
                    : 'bg-[#2a2a2a] border-white/10 hover:bg-[#3a3a3a]'
                }`}
                onClick={() => goToSlide(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-white/60 w-6">#{index + 1}</span>
                    {currentSlideIndex === index && isCameraLocked && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full" title="Camera locked to this slide" />
                    )}
                    {editingSlideId === slide.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="bg-[#3a3a3a] border border-white/10 rounded px-2 py-1 flex-1 text-sm focus:outline-none focus:border-blue-500/50"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-white/90 flex-1">
                        {slide.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(slide.id, slide.name);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Rename Slide"
                    >
                      <Edit2 className="w-3 h-3 text-white/70" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCaptureView(slide.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Capture Current View"
                    >
                      <Camera className="w-3 h-3 text-white/70" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlide(slide.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-white/60 space-y-1">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formatDuration(slide.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Camera:</span>
                    <span>Fixed View</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annotations:</span>
                    <span>{slide.annotations.length}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {!isPlaying && (
          <div>
            <h3 className="text-sm font-medium text-white/90 mb-3">Quick Actions</h3>
            
            {/* Keyboard Shortcuts Info */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-blue-400 font-medium mb-2">
                ⌨️ Keyboard Shortcuts
              </div>
              <div className="text-xs text-white/60 space-y-1">
                <div><kbd className="bg-white/10 px-1 rounded">←</kbd> Previous slide</div>
                <div><kbd className="bg-white/10 px-1 rounded">→</kbd> Next slide</div>
                <div><kbd className="bg-white/10 px-1 rounded">Space</kbd> Play/Pause</div>
                <div><kbd className="bg-white/10 px-1 rounded">Esc</kbd> Stop presentation</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addSlide('Overview')}
                className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-xs text-white/90 transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Add Overview
              </button>
              <button
                onClick={() => addSlide('Detail View')}
                className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-xs text-white/90 transition-colors flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                Add Detail
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationPanel;