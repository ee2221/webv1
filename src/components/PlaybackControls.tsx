import React from 'react';
import { 
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Unlock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';

const PlaybackControls: React.FC = () => {
  const {
    slides,
    currentSlideIndex,
    isPlaying,
    isCameraLocked,
    unlockCamera,
    previousSlide,
    nextSlide,
    pausePresentation,
    stopPresentation
  } = useSceneStore();

  if (slides.length === 0) return null;

  return (
    <div className="bg-[#1a1a1a]/95 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/20 border border-white/5 p-4">
      {/* Camera Lock Status */}
      {isCameraLocked && (
        <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-xs text-orange-400 font-medium">Camera Locked</span>
            </div>
            <button
              onClick={unlockCamera}
              className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded text-xs text-orange-400 transition-colors"
              title="Unlock Camera for Free Movement"
            >
              <Unlock className="w-3 h-3" />
            </button>
          </div>
          <div className="text-xs text-white/60 mt-1">
            Camera is locked to slide viewpoint. Click unlock for free movement.
          </div>
        </div>
      )}
      
      {/* Slide Counter */}
      <div className="text-center mb-3">
        <div className="text-xs text-white/60">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>
        <div className="text-sm font-medium text-white/90">
          {slides[currentSlideIndex]?.name}
        </div>
      </div>
      
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={previousSlide}
          disabled={slides.length === 0}
          className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:bg-[#2a2a2a] disabled:text-white/30 rounded-lg transition-colors"
          title="Previous Slide (←)"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        <button
          onClick={pausePresentation}
          className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-white"
          title="Pause Presentation (Space)"
        >
          <Pause className="w-4 h-4" />
        </button>
        
        <button
          onClick={stopPresentation}
          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
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

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-white/50 text-center">
          <div>← → Navigate • Space Pause • Esc Stop</div>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;