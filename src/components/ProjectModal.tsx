import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  Eye, 
  Edit,
  Star,
  Award,
  FileText,
  Trash2,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Layers,
  Lightbulb,
  Users
} from 'lucide-react';
import { Project } from '../types/student';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ 
  project, 
  onClose, 
  onOpen,
  onEdit,
  onDelete 
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'feedback' | 'history'>('details');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'submitted': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText;
      case 'in-progress': return Clock;
      case 'completed': return Star;
      case 'submitted': return Award;
      default: return FileText;
    }
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: Award },
    { id: 'history', label: 'History', icon: Clock }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt={project.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <span className="text-blue-600 font-bold text-lg">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(project.status)}`}>
                  {React.createElement(getStatusIcon(project.status), { className: 'w-3 h-3' })}
                  {project.status.replace('-', ' ')}
                </div>
                {project.grade !== undefined && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Award className="w-3 h-3" />
                    <span className="text-xs font-medium">{project.grade}/100</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onOpen}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in 3D Editor
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.length > 0 ? (
                        project.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Project Statistics</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          Objects:
                        </span>
                        <span className="text-gray-900 font-medium">{project.sceneData.objects.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Lights:
                        </span>
                        <span className="text-gray-900 font-medium">{project.sceneData.lights.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Groups:
                        </span>
                        <span className="text-gray-900 font-medium">{project.sceneData.groups.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-gray-900 font-medium">{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Modified:</span>
                        <span className="text-gray-900 font-medium">{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scene Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Scene Objects</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {project.sceneData.objects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {project.sceneData.objects.slice(0, 6).map((obj, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: obj.color || '#44aa88' }}
                          />
                          <span className="text-sm text-gray-900 truncate">{obj.name}</span>
                        </div>
                      ))}
                      {project.sceneData.objects.length > 6 && (
                        <div className="flex items-center justify-center p-2 bg-white rounded border border-gray-200 text-gray-500 text-sm">
                          +{project.sceneData.objects.length - 6} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No objects in this project</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {project.grade !== undefined ? (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Grade</h3>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-600">{project.grade}/100</span>
                    </div>
                  </div>
                  
                  {project.feedback && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Instructor Feedback</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{project.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Grade Yet</h3>
                  <p className="text-sm">This project hasn't been graded yet</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Project Created</span>
                  <span className="text-xs text-gray-500 ml-auto">{formatDate(project.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 ml-5">Initial project setup</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Last Modified</span>
                  <span className="text-xs text-gray-500 ml-auto">{formatDate(project.updatedAt)}</span>
                </div>
                <p className="text-sm text-gray-600 ml-5">Project content updated</p>
              </div>
              
              {project.grade !== undefined && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Graded</span>
                    <span className="text-xs text-gray-500 ml-auto">Recently</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">Received grade: {project.grade}/100</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last updated {formatDate(project.updatedAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            )}
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              title="Copy Project Link"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;