import React, { useState } from 'react';
import { Save, Cloud, Check, AlertCircle, Loader2, FolderPlus, ChevronDown } from 'lucide-react';
import { Mesh, MeshStandardMaterial, BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry } from 'three';
import { useSceneStore } from '../store/sceneStore';

interface SaveButtonProps {
  user: any;
  currentProject?: any;
  onQuickSave?: () => void;
  onSaveAs?: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ user, currentProject, onQuickSave, onSaveAs }) => {
  const { 
    objects, 
    groups, 
    lights, 
    sceneSettings
  } = useSceneStore();
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  const handleQuickSave = async () => {
    if (!currentProject || !onQuickSave) return;
    
    setSaveStatus('saving');
    setSaveMessage('Saving to ' + currentProject.name + '...');
    
    try {
      await onQuickSave();
      setSaveStatus('success');
      setSaveMessage('Saved to ' + currentProject.name);
      
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 2000);
    } catch (error) {
      console.error('Save button error:', error);
      setSaveStatus('error');
      setSaveMessage('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
      
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 5000);
    }
  };

  const handleSaveAs = () => {
    if (onSaveAs) {
      onSaveAs();
    }
    setShowSaveMenu(false);
  };

  const getButtonContent = () => {
    switch (saveStatus) {
      case 'success':
        return (
          <>
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              {currentProject ? `Saved to ${currentProject.name}` : 'Saved!'}
            </span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">Error</span>
          </>
        );
      case 'saving':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </>
        );
      default:
        if (currentProject) {
          return (
            <>
              <Save className="w-5 h-5" />
              <span className="text-sm font-medium">Save to {currentProject.name}</span>
            </>
          );
        }
        return (
          <>
            <FolderPlus className="w-5 h-5" />
            <span className="text-sm font-medium">Save as Project</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl shadow-black/20 border transition-all duration-200 font-medium";
    
    switch (saveStatus) {
      case 'success':
        return `${baseStyles} bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:scale-105 active:scale-95`;
      case 'error':
        return `${baseStyles} bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:scale-105 active:scale-95`;
      case 'saving':
        return `${baseStyles} bg-blue-500/20 border-blue-500/30 text-blue-400 cursor-not-allowed`;
      default:
        return `${baseStyles} bg-[#1a1a1a] border-white/5 text-white/90 hover:bg-[#2a2a2a] hover:scale-105 active:scale-95`;
    }
  };

  const isDisabled = !user || saveStatus === 'saving';
  const hasContent = objects.length > 0 || groups.length > 0 || lights.length > 0;

  return (
    <div className="relative">
      <div className="flex flex-col items-start gap-2">
        {currentProject ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickSave}
              disabled={isDisabled || !hasContent}
              className={getButtonStyles()}
              title={
                !user
                  ? 'Sign in to save'
                  : !hasContent 
                    ? 'No content to save' 
                    : `Save current scene to ${currentProject.name}`
              }
            >
              {getButtonContent()}
            </button>
            
            <button
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              disabled={isDisabled}
              className="p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 transition-all duration-200 text-white/90"
              title="Save Options"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSaveAs}
            disabled={isDisabled || !hasContent}
            className={getButtonStyles()}
            title={
              !user
                ? 'Sign in to save'
                : !hasContent 
                  ? 'No content to save' 
                  : 'Save current scene as a new project'
            }
          >
            {getButtonContent()}
          </button>
        )}
        
        {/* Save Options Menu */}
        {showSaveMenu && currentProject && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowSaveMenu(false)}
            />
            <div className="absolute top-full left-0 mt-2 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-50 min-w-48">
              <button
                onClick={handleQuickSave}
                disabled={isDisabled || !hasContent}
                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2 text-white/90 disabled:text-white/30 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save to {currentProject.name}
              </button>
              <button
                onClick={handleSaveAs}
                disabled={isDisabled || !hasContent}
                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2 text-white/90 disabled:text-white/30 disabled:cursor-not-allowed border-t border-white/10"
              >
                <FolderPlus className="w-4 h-4" />
                Save as New Project
              </button>
            </div>
          </>
        )}
        
        {/* Status Message */}
        {saveMessage && (
          <div className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
            saveStatus === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : saveStatus === 'error'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            {saveMessage}
          </div>
        )}
        
        {/* Scene Info */}
        {hasContent && user && (
          <div className="bg-[#1a1a1a]/90 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60">
            <div className="font-medium text-white/80 mb-1">
              {currentProject ? `Current: ${currentProject.name}` : 'Unsaved Scene'}
            </div>
            <div className="flex items-center gap-4">
              {objects.length > 0 && (
                <span>{objects.length} object{objects.length !== 1 ? 's' : ''}</span>
              )}
              {groups.length > 0 && (
                <span>{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
              )}
              {lights.length > 0 && (
                <span>{lights.length} light{lights.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveButton;