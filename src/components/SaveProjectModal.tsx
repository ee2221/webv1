import React, { useState } from 'react';
import { Save, Check, AlertCircle, Loader2, FolderPlus, X } from 'lucide-react';
import { saveProject } from '../services/studentService';
import { getStudentByEmail } from '../services/studentService';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';
import { extractObjectGeometryParams } from '../utils/sceneDataHelpers';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProjectSaved?: (project: any) => void;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onProjectSaved 
}) => {
  const { 
    objects, 
    groups, 
    lights, 
    sceneSettings, 
    slides,
    presentationSettings
  } = useSceneStore();
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    status: 'draft' as const
  });
  const [newTag, setNewTag] = useState('');

  const handleSaveAsProject = async () => {
    if (!user) {
      setSaveStatus('error');
      setSaveMessage('Please sign in to save');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
      return;
    }

    if (!projectData.name.trim()) {
      setSaveStatus('error');
      setSaveMessage('Project name is required');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('Saving project...');

    try {
      // Get student data
      const student = await getStudentByEmail(user.email);
      if (!student) {
        throw new Error('Student profile not found');
      }

      // Prepare scene data
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

      // Create project payload
      const projectPayload = {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
        tags: projectData.tags,
        status: projectData.status,
        studentId: student.id,
        sceneData
      };

      // Save project
      const projectId = await saveProject(projectPayload);
      const savedProject = { id: projectId, ...projectPayload };

      setSaveStatus('success');
      setSaveMessage('Project saved successfully!');
      
      // Reset form
      setProjectData({
        name: '',
        description: '',
        tags: [],
        status: 'draft'
      });

      // Notify parent component
      if (onProjectSaved) {
        onProjectSaved(savedProject);
      }
      
      // Close modal and reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Save project error:', error);
      setSaveStatus('error');
      setSaveMessage('Failed to save project');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 5000);
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

  const handleClose = () => {
    // Reset form when closing
    setProjectData({
      name: '',
      description: '',
      tags: [],
      status: 'draft'
    });
    setNewTag('');
    setSaveStatus('idle');
    setSaveMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]">
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
            <FolderPlus className="w-6 h-6 text-blue-400" />
            Save as Project
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              placeholder="Enter project name..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description
            </label>
            <textarea
              value={projectData.description}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
              placeholder="Describe your project..."
              rows={3}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Tags
            </label>
            <div className="space-y-2">
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
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              {projectData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {projectData.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20"
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Status
            </label>
            <select
              value={projectData.status}
              onChange={(e) => setProjectData({ ...projectData, status: e.target.value as any })}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500/50"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Scene Summary */}
          <div className="bg-[#2a2a2a] rounded-lg p-3 border border-white/10">
            <h3 className="text-sm font-medium text-white/70 mb-2">Scene Summary</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-400">{objects.length}</div>
                <div className="text-xs text-white/60">Objects</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-400">{lights.length}</div>
                <div className="text-xs text-white/60">Lights</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{groups.length}</div>
                <div className="text-xs text-white/60">Groups</div>
              </div>
            </div>
          </div>

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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={saveStatus === 'saving'}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAsProject}
              disabled={saveStatus === 'saving' || !projectData.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Project
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveProjectModal;