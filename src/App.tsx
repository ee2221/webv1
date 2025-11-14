import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import * as THREE from 'three';
import { useStudent } from './hooks/useStudent';
import Scene from './components/Scene';
import Toolbar from './components/Toolbar';
import ActionsToolbar from './components/ActionsToolbar';
import LayersPanel from './components/LayersPanel';
import ObjectProperties from './components/ObjectProperties';
import EditControls from './components/EditControls';
import CameraPerspectivePanel from './components/CameraPerspectivePanel';
import LightingPanel from './components/LightingPanel';
import SettingsPanel, { HideInterfaceButton } from './components/SettingsPanel';
import SaveButton from './components/SaveButton';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import ModeToggle from './components/ModeToggle';
import SaveProjectModal from './components/SaveProjectModal';
import PresentationPanel from './components/PresentationPanel';
import PresentationToolbar from './components/PresentationToolbar';
import PlaybackControls from './components/PlaybackControls';
import StudentPortal from './components/StudentPortal';
import { useSceneStore } from './store/sceneStore';
import { extractObjectGeometryParams } from './utils/sceneDataHelpers';
import { updateProject } from './services/studentService';

function App() {
  const { sceneSettings, applicationMode, isPlaying, setApplicationMode } = useSceneStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveProjectModal, setShowSaveProjectModal] = useState(false);
  const [currentView, setCurrentView] = useState<'student-portal' | '3d-editor'>('student-portal');
  const [currentProject, setCurrentProject] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Show auth modal if no user is signed in
      if (!user) {
        setShowAuthModal(true);
        setCurrentView('student-portal'); // Always start at student portal
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setCurrentView('student-portal'); // Go to student portal after auth
  };

  const handleSignOut = () => {
    setUser(null);
    setShowAuthModal(true);
    setCurrentView('student-portal');
  };

  const handleOpen3DEditor = (project?: any) => {
    if (project) {
      // Load existing project data into the scene
      console.log('Loading project into 3D editor:', project);
      const { loadProjectFromData } = useSceneStore.getState();
      
      // Load project data asynchronously
      loadProjectFromData(project).then(() => {
        setCurrentProject(project);
        setCurrentView('3d-editor');
      }).catch((error) => {
        console.error('Failed to load project:', error);
        // Still open the editor even if some models failed to load
        setCurrentProject(project);
        setCurrentView('3d-editor');
      });
    } else {
      // For new projects, ensure we start with a completely fresh state
      const { resetToInitialState } = useSceneStore.getState();
      resetToInitialState();
      setCurrentProject(null);
      setCurrentView('3d-editor');
    }
  };

  const handleBackToStudentPortal = () => {
    setCurrentView('student-portal');
    setCurrentProject(null);
  };

  const handleQuickSave = async () => {
    if (!currentProject || !user) return;
    
    try {
      // Get current scene data
      const { objects, lights, groups, sceneSettings, slides, presentationSettings } = useSceneStore.getState();
      
      // Prepare scene data for saving
      const sceneData = {
        objects: objects.map(obj => ({
          id: obj.id,
          name: obj.name,
          visible: obj.visible,
          locked: obj.locked,
          groupId: obj.groupId ?? null,
          position: {
            x: obj.object.position.x,
            y: obj.object.position.y,
            z: obj.object.position.z
          },
          rotation: {
            x: obj.object.rotation.x,
            y: obj.object.rotation.y,
            z: obj.object.rotation.z
          },
          scale: {
            x: obj.object.scale.x,
            y: obj.object.scale.y,
            z: obj.object.scale.z
          },
          color: obj.object instanceof THREE.Mesh && obj.object.material instanceof THREE.MeshStandardMaterial
            ? '#' + obj.object.material.color.getHexString()
            : '#44aa88',
          // Persist wireframe (edges) appearance if present
          wireframe: (() => {
            try {
              const wfObj = (obj.object as any)?.userData?.wireframeObject as any;
              const wfMat = (obj.object as any)?.userData?.wireframeMaterial as any;
              const wfLinewidth = (obj.object as any)?.userData?.wireframeLinewidth ?? 1;
              if (wfObj && wfMat) {
                const color = '#' + (wfMat.color?.getHexString?.() || 'ffffff');
                const opacity = typeof wfMat.opacity === 'number' ? wfMat.opacity : 1;
                const visible = !!wfObj.visible;
                return { visible, color, opacity, linewidth: wfLinewidth };
              }
            } catch {}
            return null;
          })(),
          type: obj.object.type,
          geometryParams: extractObjectGeometryParams(obj.object),
          geometryData: (() => {
            if (obj.object instanceof THREE.Mesh && obj.object.geometry) {
              const geometry = obj.object.geometry as THREE.BufferGeometry;
              const positionAttr = geometry.getAttribute('position');
              const indexAttr = geometry.getIndex();
              if (positionAttr) {
                return {
                  position: Array.from(positionAttr.array as ArrayLike<number>),
                  index: indexAttr ? Array.from(indexAttr.array as ArrayLike<number>) : null
                };
              }
            }
            return null;
          })()
        })),
        lights: lights.map(light => ({
          id: light.id,
          name: light.name,
          type: light.type,
          position: light.position,
          target: light.target,
          intensity: light.intensity,
          color: light.color,
          visible: light.visible,
          castShadow: light.castShadow,
          distance: light.distance,
          decay: light.decay,
          angle: light.angle,
          penumbra: light.penumbra
        })),
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          expanded: group.expanded,
          visible: group.visible,
          locked: group.locked,
          objectIds: group.objectIds
        })),
        settings: sceneSettings,
        slides: slides,
        presentationSettings: presentationSettings
      };

      // Update the existing project with new scene data
      await updateProject(currentProject.id, {
        sceneData,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Project saved successfully:', currentProject.name);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error; // Re-throw so SaveButton can handle the error
    }
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Student Portal as main interface
  if (currentView === 'student-portal') {
    return (
      <>
        <StudentPortal 
          user={user} 
          onOpen3DEditor={handleOpen3DEditor}
          onSignOut={handleSignOut}
        />
        
        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Show 3D Editor when accessed from student portal
  return (
    <div className="w-full h-screen relative">
      <Scene />
      
      {/* Back to Student Portal Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackToStudentPortal}
          className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 transition-all duration-200 hover:scale-105 text-white/90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Projects</span>
        </button>
      </div>
      
      {/* Top Controls - Positioned to avoid overlap with back button */}
      <div className="fixed top-4 left-48 flex items-center gap-4 z-50">
        {/* Save Button - When user is authenticated */}
        {user && <SaveButton 
          user={user} 
          currentProject={currentProject}
          onQuickSave={handleQuickSave}
          onSaveAs={() => setShowSaveProjectModal(true)}
        />}
        
        {/* User Profile - When user is authenticated */}
        {user && <UserProfile user={user} onSignOut={handleSignOut} />}
      </div>
      
      {/* Mode Toggle */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <ModeToggle />
      </div>
      
      {/* Conditionally render UI panels based on hideAllMenus setting */}
      {!sceneSettings.hideAllMenus && !isPlaying && (
        <>
          {applicationMode === 'modeling' ? (
            <>
              <ActionsToolbar />
              <Toolbar />
              <LayersPanel />
              <ObjectProperties />
              <EditControls />
              <CameraPerspectivePanel />
              <LightingPanel />
            </>
          ) : (
            <>
              <PresentationToolbar />
            </>
          )}
        </>
      )}
      
      {/* Presentation Panel - Always visible in presentation mode */}
      {applicationMode === 'presentation' && <PresentationPanel />}
      
      {/* Playback Controls - Top right when playing */}
      {applicationMode === 'presentation' && isPlaying && (
        <div className="fixed top-4 right-4 z-50">
          <PlaybackControls />
        </div>
      )}
      
      {/* Settings panel is always visible */}
      <SettingsPanel />
      
      {/* Save Project Modal - Rendered at app level with highest z-index */}
      <SaveProjectModal
        isOpen={showSaveProjectModal}
        onClose={() => setShowSaveProjectModal(false)}
        user={user}
        onProjectSaved={() => {
          console.log('Project saved, refreshing...');
          setShowSaveProjectModal(false);
        }}
      />
    </div>
  );
}

export default App;