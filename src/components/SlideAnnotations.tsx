import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useSceneStore } from '../store/sceneStore';
import { MessageSquare, X, Edit2, Move } from 'lucide-react';
import * as THREE from 'three';

interface AnnotationProps {
  annotation: {
    id: string;
    text: string;
    position: { x: number; y: number; z: number };
    screenPosition?: { x: number; y: number };
    fontSize?: number;
    color?: string;
    type?: 'point' | 'text';
  };
  slideId: string;
  currentlyEditingAnnotationId: string | null;
  onStartEdit?: (annotationId: string) => void;
  onRemove: () => void;
  onMove: (newPosition: { x: number; y: number; z: number }) => void;
}

const Annotation: React.FC<AnnotationProps> = ({
  annotation,
  slideId,
  currentlyEditingAnnotationId,
  onStartEdit,
  onRemove,
  onMove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const { camera, raycaster, gl } = useThree();

  const isTextAnnotation = annotation.type === 'text';
  const isEditing = currentlyEditingAnnotationId === annotation.id;
  const fontSize = annotation.fontSize || 16;
  const color = annotation.color || '#ffffff';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTextAnnotation && !isEditing) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Set cursor style
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isTextAnnotation) return;
    
    e.preventDefault();
    
    // Get normalized device coordinates for current mouse position
    const rect = gl.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Create a plane at the annotation's current depth from camera
    const annotationWorldPos = new THREE.Vector3(
      annotation.position.x,
      annotation.position.y,
      annotation.position.z
    );
    
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const dragPlane = new THREE.Plane();
    dragPlane.setFromNormalAndCoplanarPoint(cameraDirection, annotationWorldPos);
    
    // Cast ray from camera through mouse position
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
    
    // Find intersection with the drag plane
    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
      onMove({
        x: intersection.x,
        y: intersection.y,
        z: intersection.z
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  // Add event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, annotation.position, camera]);

  return (
    <Html position={[annotation.position.x, annotation.position.y, annotation.position.z]}>
      <div
        className="annotation-container"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {isTextAnnotation ? (
          <div
            className="text-annotation group relative"
            style={{
              fontSize: `${fontSize}px`,
              color: color,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)'
            }}
          >
            {annotation.text}
            <div className="annotation-controls absolute top-full left-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              <button
                onClick={() => onStartEdit?.(annotation.id)}
                className="px-2 py-1 bg-blue-500/90 hover:bg-blue-600 rounded text-xs font-medium transition-colors flex items-center gap-1 text-white shadow-lg"
                title="Edit Text"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={onRemove}
                className="px-2 py-1 bg-red-500/90 hover:bg-red-600 rounded text-xs font-medium transition-colors flex items-center gap-1 text-white shadow-lg"
                title="Remove Text"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="point-annotation">
            <div
              className="annotation-point"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: color,
                border: '2px solid white',
                cursor: 'pointer'
              }}
            />
            <div className="annotation-controls absolute top-full left-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              <button
                onClick={() => onStartEdit?.(annotation.id)}
                className="px-2 py-1 bg-blue-500/90 hover:bg-blue-600 rounded text-xs font-medium transition-colors flex items-center gap-1 text-white shadow-lg"
                title="Edit Point"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={onRemove}
                className="px-2 py-1 bg-red-500/90 hover:bg-red-600 rounded text-xs font-medium transition-colors flex items-center gap-1 text-white shadow-lg"
                title="Remove Point"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};

interface SlideAnnotationsProps {
  editingAnnotationId: string | null;
  setEditingAnnotationId: (id: string | null) => void;
}

const SlideAnnotations: React.FC<SlideAnnotationsProps> = ({
  editingAnnotationId,
  setEditingAnnotationId
}) => {
  const { 
    slides, 
    currentSlideIndex, 
    presentationSettings,
    updateSlide,
    removeAnnotation
  } = useSceneStore();
  

  if (!presentationSettings.showAnnotations || !slides[currentSlideIndex]) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];

  const handleMove = (annotationId: string, newPosition: { x: number; y: number; z: number }) => {
    const updatedAnnotations = currentSlide.annotations.map(ann =>
      ann.id === annotationId ? { ...ann, position: newPosition } : ann
    );
    updateSlide(currentSlide.id, { annotations: updatedAnnotations });
  };

  const handleCancelEdit = () => {
    // Implementation for cancel edit
  };

  const handleRemove = (annotationId: string) => {
    removeAnnotation(currentSlide.id, annotationId);
  };

  return (
    <group>
      {(currentSlide?.annotations || []).map((annotation) => (
        <Annotation
          key={annotation.id}
          annotation={annotation}
          slideId={currentSlide.id}
          currentlyEditingAnnotationId={editingAnnotationId}
          onStartEdit={setEditingAnnotationId}
          onRemove={() => removeAnnotation(currentSlide.id, annotation.id)}
          onMove={(newPosition) => handleMove(annotation.id, newPosition)}
        />
      ))}
    </group>
  );
};

export default SlideAnnotations;