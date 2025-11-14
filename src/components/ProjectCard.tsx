import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Eye, 
  Edit,
  Star,
  Award,
  FileText,
  Layers,
  Lightbulb,
  Users,
  MoreVertical,
  ExternalLink,
  Save,
  Copy,
  Share2,
  Download,
  Trash2
} from 'lucide-react';
import { Project } from '../types/student';

// Mini 3D Preview Component
const ProjectPreview: React.FC<{ sceneData: any }> = ({ sceneData }) => {
  const recreateObjects = () => {
    const objects: THREE.Object3D[] = [];
    
    if (sceneData.objects) {
      sceneData.objects.forEach((objData: any) => {
        try {
          let geometry: THREE.BufferGeometry;
          
          // Recreate geometry based on saved parameters
          if (objData.geometryParams) {
            switch (objData.geometryParams.type) {
              case 'imported':
                // For imported models in preview, show a distinctive placeholder
                geometry = new THREE.BoxGeometry(1, 1, 1);
                // Create a special material to indicate it's an imported model
                const importedMaterial = new THREE.MeshStandardMaterial({
                  color: '#4a90e2',
                  transparent: true,
                  opacity: 0.8,
                  wireframe: true
                });
                const importedMesh = new THREE.Mesh(geometry, importedMaterial);
                
                // Apply transforms
                if (objData.position) {
                  importedMesh.position.set(objData.position.x, objData.position.y, objData.position.z);
                }
                if (objData.rotation) {
                  importedMesh.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);
                }
                if (objData.scale) {
                  importedMesh.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                }
                
                importedMesh.visible = objData.visible !== false;
                objects.push(importedMesh);
                return; // Skip the normal mesh creation below
              case 'box':
                geometry = new THREE.BoxGeometry(
                  objData.geometryParams.width || 1,
                  objData.geometryParams.height || 1,
                  objData.geometryParams.depth || 1
                );
                break;
              case 'sphere':
                geometry = new THREE.SphereGeometry(
                  objData.geometryParams.radius || 0.5,
                  Math.min(objData.geometryParams.widthSegments || 16, 16), // Reduce segments for preview
                  Math.min(objData.geometryParams.heightSegments || 8, 8)
                );
                break;
              case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                  objData.geometryParams.radiusTop || 0.5,
                  objData.geometryParams.radiusBottom || 0.5,
                  objData.geometryParams.height || 1,
                  Math.min(objData.geometryParams.radialSegments || 16, 16)
                );
                break;
              case 'cone':
                geometry = new THREE.ConeGeometry(
                  objData.geometryParams.radius || 0.5,
                  objData.geometryParams.height || 1,
                  Math.min(objData.geometryParams.radialSegments || 16, 16)
                );
                break;
              case 'torus':
                geometry = new THREE.TorusGeometry(
                  objData.geometryParams.radius || 1,
                  objData.geometryParams.tube || 0.4,
                  Math.min(objData.geometryParams.radialSegments || 8, 8),
                  Math.min(objData.geometryParams.tubularSegments || 32, 32)
                );
                break;
              case 'custom':
                // For custom shapes in preview, create a box that matches the original bounding box
                if (objData.geometryParams.boundingBox) {
                  const bbox = objData.geometryParams.boundingBox;
                  const width = bbox.max.x - bbox.min.x;
                  const height = bbox.max.y - bbox.min.y;
                  const depth = bbox.max.z - bbox.min.z;
                  geometry = new THREE.BoxGeometry(width, height, depth);
                  
                  // Create a special material to indicate it's a custom shape
                  const customMaterial = new THREE.MeshStandardMaterial({
                    color: '#9333ea',
                    transparent: true,
                    opacity: 0.7,
                    wireframe: true
                  });
                  const customMesh = new THREE.Mesh(geometry, customMaterial);
                  
                  // Apply transforms
                  if (objData.position) {
                    customMesh.position.set(objData.position.x, objData.position.y, objData.position.z);
                  }
                  if (objData.rotation) {
                    customMesh.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);
                  }
                  if (objData.scale) {
                    customMesh.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                  }
                  
                  customMesh.visible = objData.visible !== false;
                  objects.push(customMesh);
                  return; // Skip the normal mesh creation below
                } else {
                  geometry = new THREE.BoxGeometry(1, 1, 1);
                }
                break;
              default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
            }
          } else {
            geometry = new THREE.BoxGeometry(1, 1, 1);
          }
          
          // Create material with saved color
          const material = new THREE.MeshStandardMaterial({
            color: objData.color || '#44aa88',
            roughness: 0.7,
            metalness: 0.1
          });
          
          // If raw geometry data exists, rebuild to reflect edited vertices
          if (objData.geometryData && objData.geometryData.position && Array.isArray(objData.geometryData.position)) {
            try {
              const rebuilt = new THREE.BufferGeometry();
              const pos = new Float32Array(objData.geometryData.position);
              rebuilt.setAttribute('position', new THREE.BufferAttribute(pos, 3));
              if (objData.geometryData.index && Array.isArray(objData.geometryData.index)) {
                rebuilt.setIndex(objData.geometryData.index);
              }
              rebuilt.computeVertexNormals();
              geometry = rebuilt;
            } catch (e) {
              console.warn('Preview: failed to rebuild geometry for', objData.name, e);
            }
          }

          // Create mesh
          const mesh = new THREE.Mesh(geometry, material);
          
          // Apply transforms
          if (objData.position) {
            mesh.position.set(objData.position.x, objData.position.y, objData.position.z);
          }
          if (objData.rotation) {
            mesh.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);
          }
          if (objData.scale) {
            mesh.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
          }
          
          mesh.visible = objData.visible !== false;
          
          objects.push(mesh);
        } catch (error) {
          console.warn('Failed to recreate object for preview:', objData.name, error);
        }
      });
    }
    
    return objects;
  };

  const objects = recreateObjects();
  
  // If no objects, show placeholder
  if (objects.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-1">📦</div>
          <div className="text-xs">Empty Scene</div>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [3, 3, 3], fov: 50 }}
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    >
      {/* Lighting for preview */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      {/* Render objects */}
      {objects.map((object, index) => (
        <primitive key={index} object={object} />
      ))}
      
      {/* Auto-rotating camera */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
};

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
  compact?: boolean;
  onQuickSave?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onRename?: (newName: string) => void;
  onUpdateDescription?: (newDescription: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onClick, 
  viewMode = 'grid',
  compact = false,
  onQuickSave,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
  onRename,
  onUpdateDescription
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [tempName, setTempName] = useState(project.name);
  const [tempDescription, setTempDescription] = useState(project.description);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: viewMode === 'list' ? 'numeric' : undefined
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

  const handleRename = () => {
    if (onRename && tempName.trim() && tempName.trim() !== project.name) {
      onRename(tempName.trim());
    }
    setShowRenameModal(false);
    setShowActions(false);
  };

  const handleUpdateDescription = () => {
    if (onUpdateDescription && tempDescription.trim() !== project.description) {
      onUpdateDescription(tempDescription.trim());
    }
    setShowDescriptionModal(false);
    setShowActions(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality - copy project link to clipboard
      const projectUrl = `${window.location.origin}/project/${project.id}`;
      navigator.clipboard.writeText(projectUrl).then(() => {
        alert('Project link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link to clipboard');
      });
    }
    setShowActions(false);
  };
  if (viewMode === 'list' && !compact) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 group relative">
        <div className="flex items-center justify-between">
          <div 
            onClick={onClick}
            className="flex items-center gap-4 flex-1 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-xl shadow-sm overflow-hidden">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt={project.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <ProjectPreview sceneData={project.sceneData} />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {project.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Updated {formatDate(project.updatedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {project.sceneData.objects.length} objects
                </span>
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {project.sceneData.lights.length} lights
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.sceneData.groups.length} groups
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {project.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs border border-blue-200 font-medium"
              >
                {tag}
              </span>
            ))}
            
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status.replace('-', ' ')}
            </div>
            
            {project.grade !== undefined && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">
                <Award className="w-3 h-3" />
                <span className="text-xs font-medium">{project.grade}/100</span>
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                title="Project Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Actions Dropdown */}
              {showActions && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Project
                    </button>
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempName(project.name);
                        setShowRenameModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Rename Project
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempDescription(project.description);
                        setShowDescriptionModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Edit Description
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Project
                    </button>
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Project
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Rename Modal */}
        {showRenameModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename Project</h3>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new project name..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setShowRenameModal(false);
                  }}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowRenameModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRename}
                    disabled={!tempName.trim() || tempName.trim() === project.name}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                  >
                    Rename
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Description Modal */}
        {showDescriptionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Description</h3>
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter project description..."
                  rows={4}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) handleUpdateDescription();
                    if (e.key === 'Escape') setShowDescriptionModal(false);
                  }}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowDescriptionModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDescription}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Tip: Press Ctrl+Enter to save quickly
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group overflow-hidden relative ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Three Dots Menu */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
          title="Project Actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {/* Actions Dropdown */}
        {showActions && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open Project
              </button>
              
              <div className="border-t border-gray-200 my-1"></div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTempName(project.name);
                  setShowRenameModal(true);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Rename Project
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTempDescription(project.description);
                  setShowDescriptionModal(true);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Edit Description
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Project
              </button>
              
              <div className="border-t border-gray-200 my-1"></div>
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail */}
      <div 
        onClick={onClick}
        className={`rounded-xl mb-4 shadow-sm cursor-pointer overflow-hidden ${
        compact ? 'h-32' : 'h-40'
      }`}>
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={project.name}
            className="w-full h-full rounded-xl object-cover"
          />
        ) : (
          <ProjectPreview sceneData={project.sceneData} />
        )}
      </div>

      {/* Content */}
      <div 
        onClick={onClick}
        className="space-y-3 cursor-pointer"
      >
        <div>
          <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {project.name}
          </h3>
          <p className={`text-gray-600 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {project.description}
          </p>
        </div>

        {/* Status and Grade */}
        <div className="flex items-center justify-between">
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

        {/* Scene Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {project.sceneData.objects.length}
            </span>
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              {project.sceneData.lights.length}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.sceneData.groups.length}
            </span>
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, compact ? 2 : 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs border border-blue-200 font-medium"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > (compact ? 2 : 3) && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-full text-xs">
                +{project.tags.length - (compact ? 2 : 3)}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between pt-2 border-t border-gray-100 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          <span className="text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(project.updatedAt)}
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all duration-200">
            <ExternalLink className="w-3 h-3" />
            Open
          </div>
        </div>
      </div>
      
      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename Project</h3>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new project name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setShowRenameModal(false);
                }}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  disabled={!tempName.trim() || tempName.trim() === project.name}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Description</h3>
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter project description..."
                rows={4}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleUpdateDescription();
                  if (e.key === 'Escape') setShowDescriptionModal(false);
                }}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDescription}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
                >
                  Save
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Tip: Press Ctrl+Enter to save quickly
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;