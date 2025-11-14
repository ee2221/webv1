import React, { useState } from 'react';
import { 
  ArrowLeft,
  Save,
  FileText,
  Tag,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types/student';
import { saveProject, updateProject } from '../services/studentService';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';
import { extractObjectGeometryParams } from '../utils/sceneDataHelpers';

interface ProjectManagerProps {
  student: any;
  existingProject?: Project;
  onBack: () => void;
  onSave: (project: Project) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  student,
  existingProject,
  onBack,
  onSave
}) => {
  const { objects, lights, groups, sceneSettings } = useSceneStore();
  
  const [projectData, setProjectData] = useState({
    name: existingProject?.name || '',
    description: existingProject?.description || '',
    tags: existingProject?.tags || [],
    status: existingProject?.status || 'draft' as const
  });
  
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!projectData.name.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('idle');

    try {
      const sceneData = {
        objects: objects.map(obj => ({
          id: obj.id,
          name: obj.name,
          visible: obj.visible,
          locked: obj.locked,
          groupId: obj.groupId ?? null,
          // Store basic object properties
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
          // Persist raw geometry data so vertex/edge edits survive reload
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
          })(),
          // Persist geometry params using extractor so primitives (e.g. cones) retain type data
          geometryParams: extractObjectGeometryParams(obj.object)
        })),
        lights: lights.map(light => ({
          id: light.id,
          name: light.name,
          type: light.type,
          position: light.position,
          target: light.target,
          intensity: light.intensity,
          color: light.color,
          visible: light.visible
        })),
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          expanded: group.expanded,
          visible: group.visible,
          locked: group.locked,
          objectIds: group.objectIds
        })),
        settings: sceneSettings
      };

      const projectPayload = {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
        tags: projectData.tags,
        status: projectData.status,
        studentId: student.id,
        sceneData
      };

      let savedProject: Project;

      if (existingProject) {
        // Update existing project
        await updateProject(existingProject.id, projectPayload);
        savedProject = { ...existingProject, ...projectPayload };
      } else {
        // Create new project
        const projectId = await saveProject({
          ...projectPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        savedProject = { 
          id: projectId, 
          ...projectPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      setSaveStatus('success');
      onSave(savedProject);
      
      // Auto-close after successful save
      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error) {
      console.error('Error saving project:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !projectData.tags.includes(newTag.trim())) {
      setProjectData({
        ...projectData,
        tags: [...projectData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectData({
      ...projectData,
      tags: projectData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-gray-400' },
    { value: 'in-progress', label: 'In Progress', color: 'text-blue-400' },
    { value: 'completed', label: 'Completed', color: 'text-green-400' },
    { value: 'submitted', label: 'Submitted', color: 'text-purple-400' }
  ];

  return (
    <div className="w-full h-screen bg-[#0f0f23] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white/90">
                {existingProject ? 'Edit Project' : 'Save Project'}
              </h1>
              <p className="text-sm text-white/60">
                {existingProject ? 'Update your project details' : 'Save your 3D scene as a project'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || !projectData.name.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              saving
                ? 'bg-blue-500/50 cursor-not-allowed text-white/70'
                : saveStatus === 'success'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : saveStatus === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : !projectData.name.trim()
                      ? 'bg-gray-600 cursor-not-allowed text-white/50'
                      : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {existingProject ? 'Update Project' : 'Save Project'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              placeholder="Enter a name for your project..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description
            </label>
            <textarea
              value={projectData.description}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
              placeholder="Describe your project, techniques used, goals, etc..."
              rows={4}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          {/* Project Status */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Status
            </label>
            <select
              value={projectData.status}
              onChange={(e) => setProjectData({ ...projectData, status: e.target.value as any })}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:border-blue-500/50"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={addTag}
                  disabled={!newTag.trim() || projectData.tags.includes(newTag.trim())}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              {projectData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {projectData.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scene Summary */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white/70 mb-3">Scene Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{objects.length}</div>
                <div className="text-xs text-white/60">Objects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{lights.length}</div>
                <div className="text-xs text-white/60">Lights</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{groups.length}</div>
                <div className="text-xs text-white/60">Groups</div>
              </div>
            </div>
          </div>

          {/* Save Status Message */}
          {saveStatus === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {!projectData.name.trim() ? 'Project name is required' : 'Failed to save project'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;