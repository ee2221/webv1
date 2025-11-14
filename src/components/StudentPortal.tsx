import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { useStudent } from '../hooks/useStudent';
import { Project } from '../types/student';
import StudentDashboard from './StudentDashboard';
import ProjectManager from './ProjectManager';
import { useSceneStore } from '../store/sceneStore';

interface StudentPortalProps {
  user: User | null;
  onOpen3DEditor: (project?: Project) => void;
  onSignOut: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ user, onOpen3DEditor, onSignOut }) => {
  const { student, projects, loading, error } = useStudent(user);
  const [currentView, setCurrentView] = useState<'dashboard' | 'project-manager'>('dashboard');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const { setSelectedObject } = useSceneStore();

  const handleCreateProject = () => {
    setEditingProject(null);
    setCurrentView('project-manager');
  };

  const handleProjectOpen = (project: Project) => {
    // Load project data into the scene and switch to 3D editor
    console.log('Opening project in 3D editor:', project);
    
    // Load the project data into the scene store
    const { loadProjectFromData } = useSceneStore.getState();
    
    // Load project data asynchronously and then open editor
    loadProjectFromData(project).then(() => {
      onOpen3DEditor(project);
    }).catch((error) => {
      console.error('Failed to load project:', error);
      // Still open the editor even if some models failed to load
      onOpen3DEditor(project);
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setCurrentView('project-manager');
  };

  const handleSaveProject = (project: Project) => {
    console.log('Project saved:', project);
    setCurrentView('dashboard');
    setEditingProject(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditingProject(null);
  };

  const handleNew3DProject = () => {
    // Reset the entire scene to initial state for a fresh project
    const { resetToInitialState } = useSceneStore.getState();
    resetToInitialState();
    
    // Open the 3D editor with a completely fresh environment
    onOpen3DEditor();
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Student Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your student profile...</h2>
          <p className="text-gray-600">Please wait while we create your account</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <StudentDashboard
          user={user}
          student={student}
          projects={projects}
          onCreateProject={handleNew3DProject}
          onOpenProject={handleProjectOpen}
          onSignOut={onSignOut}
        />
      )}
      
      {currentView === 'project-manager' && (
        <ProjectManager
          student={student}
          existingProject={editingProject}
          onBack={handleBackToDashboard}
          onSave={handleSaveProject}
        />
      )}
    </>
  );
};

export default StudentPortal;