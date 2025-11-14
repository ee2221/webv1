import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { User as UserIcon, FolderOpen, Calendar, Award, Clock, Plus, Search, Filter, Grid3x3 as Grid3X3, List, BookOpen, Target, TrendingUp, Star, Settings, LogOut, Palette, Wrench, ChevronDown, MoreVertical, Download, Share2, CreditCard as Edit3, ExternalLink, Layers, Lightbulb, Users as UsersIcon } from 'lucide-react';
import { Student, Project, Assignment } from '../types/student';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import AssignmentCard from './AssignmentCard';

interface StudentDashboardProps {
  user: User | null;
  student: Student;
  projects: Project[];
  onCreateProject: () => void;
  onOpenProject: (project: Project) => void;
  onSignOut: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  student,
  projects,
  onCreateProject,
  onOpenProject,
  onSignOut
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
  };

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'draft', label: 'Draft' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'submitted', label: 'Submitted' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNew3DProject = () => {
    // Reset the entire scene to initial state for a fresh project
    onCreateProject();
  };

  const handleOpenExistingProject = (project: Project) => {
    // Load the existing project data into the scene
    onOpenProject(project);
  };

  const handleEditProject = (project: Project) => {
    // For now, just open the project for editing
    onOpenProject(project);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`)) {
      try {
        const { deleteProject } = await import('../services/studentService');
        await deleteProject(project.id);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleRenameProject = async (project: Project, newName: string) => {
    try {
      const { updateProject } = await import('../services/studentService');
      await updateProject(project.id, { name: newName });
    } catch (error) {
      console.error('Error renaming project:', error);
      alert('Failed to rename project. Please try again.');
    }
  };

  const handleUpdateProjectDescription = async (project: Project, newDescription: string) => {
    try {
      const { updateProject } = await import('../services/studentService');
      await updateProject(project.id, { description: newDescription });
    } catch (error) {
      console.error('Error updating project description:', error);
      alert('Failed to update project description. Please try again.');
    }
  };

  const handleShareProject = (project: Project) => {
    const projectUrl = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(projectUrl).then(() => {
      alert(`Project link copied to clipboard!\n\nShare this link: ${projectUrl}`);
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = projectUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Project link copied to clipboard!\n\nShare this link: ${projectUrl}`);
    });
  };
  const handleDuplicateProject = async (project: Project) => {
    // TODO: Implement project duplication
    console.log('Duplicate project:', project.id);
  };

  const handleExportProject = (project: Project) => {
    // TODO: Implement project export
    console.log('Export project:', project.id);
  };

  const handleCreateNewProject = () => {
    // Create a completely new project
    onCreateProject();
  };

  const handleQuickSave = (project: Project) => {
    // Quick save to existing project
    console.log('Quick save to project:', project.id);
    
    // TODO: Implement quick save functionality
    // This would save current scene state to the existing project
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Docs-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and branding */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Fractyl</h1>
                  <p className="text-sm text-gray-500">by STEAM IC</p>
                </div>
              </div>
            </div>

            {/* Right side - Actions and user menu */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-32">
                        {student.email}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                        {/* User Info Header */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Student ID: {student.studentId}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
                              <div className="text-xs text-gray-500">Projects</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
                              <div className="text-xs text-gray-500">Completed</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="p-2">
                          <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                            <Settings className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">Account Settings</span>
                          </button>
                          <button 
                            onClick={onSignOut}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {student.name?.split(' ')[0] || 'User'}
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                {student.course} • Year {student.year}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
                <div className="text-sm text-gray-500">Total Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-8 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors appearance-none"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleCreateNewProject}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New 3D Project
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Content */}
            {filteredProjects.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProjects.map(project => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => handleOpenExistingProject(project)}
                          viewMode={viewMode}
                          onDelete={() => handleDeleteProject(project)}
                          onRename={(newName) => handleRenameProject(project, newName)}
                          onUpdateDescription={(newDescription) => handleUpdateProjectDescription(project, newDescription)}
                          onShare={() => handleShareProject(project)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProjects.map(project => (
                      <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => handleOpenExistingProject(project)}
                          viewMode={viewMode}
                          onDelete={() => handleDeleteProject(project)}
                          onRename={(newName) => handleRenameProject(project, newName)}
                          onUpdateDescription={(newDescription) => handleUpdateProjectDescription(project, newDescription)}
                          onShare={() => handleShareProject(project)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FolderOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                      : 'Start creating amazing 3D models and save them as projects to build your portfolio.'
                    }
                  </p>
                  {(!searchTerm && statusFilter === 'all') && (
                    <button
                      onClick={handleCreateNewProject}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First 3D Project
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </main>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpen={() => {
            handleOpenExistingProject(selectedProject);
            setSelectedProject(null);
          }}
          onEdit={() => {
            handleEditProject(selectedProject);
            setSelectedProject(null);
          }}
          onDelete={() => handleDeleteProject(selectedProject)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;