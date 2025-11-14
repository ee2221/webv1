import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';
import { HideInterfaceButton } from './SettingsPanel';
import LightHelpers from './LightHelpers';
import SlideAnnotations from './SlideAnnotations';
import SlideTerrain from './SlideTerrain';
import * as THREE from 'three';

// Helper function to update wireframe when geometry changes
const updateWireframeForGeometry = (mesh: THREE.Mesh, geometry: THREE.BufferGeometry) => {
  if (!mesh || !(mesh instanceof THREE.Mesh)) return;
  
  const wireframeObj = (mesh as any).userData?.wireframeObject as THREE.LineSegments | THREE.Group | undefined;
  const wireframeMat = (mesh as any).userData?.wireframeMaterial as THREE.LineBasicMaterial | undefined;
  const wireframeLinewidth = (mesh as any).userData?.wireframeLinewidth ?? 1;
  
  if (!wireframeObj || !wireframeMat) return;
  
  // Remove old wireframe
  mesh.remove(wireframeObj);
  if (wireframeObj instanceof THREE.LineSegments) {
    wireframeObj.geometry.dispose();
  } else if (wireframeObj instanceof THREE.Group) {
    wireframeObj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.dispose();
      }
    });
  }
  
  // Create new wireframe from updated geometry
  if (wireframeLinewidth <= 1) {
    const edgesGeom = new THREE.EdgesGeometry(geometry);
    const newWireframeObj = new THREE.LineSegments(edgesGeom, wireframeMat);
    newWireframeObj.visible = wireframeObj.visible;
    (mesh as any).userData.wireframeObject = newWireframeObj;
    mesh.add(newWireframeObj);
  } else {
    // For thick lines, create tube geometry (simplified - you may need to implement createThickWireframe)
    const edgesGeom = new THREE.EdgesGeometry(geometry);
    const newWireframeObj = new THREE.LineSegments(edgesGeom, wireframeMat);
    newWireframeObj.visible = wireframeObj.visible;
    (mesh as any).userData.wireframeObject = newWireframeObj;
    mesh.add(newWireframeObj);
  }
};

// Vertex editing components from reference project
const VertexCoordinates = ({ position, onPositionChange }) => {
  if (!position) return null;

  const handleChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const newPosition = position.clone();
    newPosition[axis] = parseFloat(value) || 0;
    onPositionChange(newPosition);
  };

  return (
    <div className="absolute right-4 bottom-4 bg-black/90 text-white p-4 rounded-lg font-mono shadow-2xl border border-white/20">
      <div className="space-y-2">
        <div className="text-xs text-white/70 mb-2 font-medium">Vertex Position</div>
        <div className="flex items-center gap-2">
          <label className="w-8">X:</label>
          <input
            type="number"
            value={position.x.toFixed(3)}
            onChange={(e) => handleChange('x', e.target.value)}
            className="bg-gray-800 px-2 py-1 rounded w-24 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
            step="0.1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-8">Y:</label>
          <input
            type="number"
            value={position.y.toFixed(3)}
            onChange={(e) => handleChange('y', e.target.value)}
            className="bg-gray-800 px-2 py-1 rounded w-24 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
            step="0.1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-8">Z:</label>
          <input
            type="number"
            value={position.z.toFixed(3)}
            onChange={(e) => handleChange('z', e.target.value)}
            className="bg-gray-800 px-2 py-1 rounded w-24 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
            step="0.1"
          />
        </div>
        <div className="text-xs text-white/50 mt-2">
          Click and drag vertices to move them
        </div>
      </div>
    </div>
  );
};

const VertexPoints = ({ geometry, object }) => {
  const { editMode, selectedElements, setSelectedElements, startVertexDrag, updateVertexDrag, endVertexDrag } = useSceneStore();
  const { camera, raycaster, pointer } = useThree();
  const positions = geometry.attributes.position;
  const [isDragging, setIsDragging] = useState(false);
  const [draggedVertexGroup, setDraggedVertexGroup] = useState<number[] | null>(null);
  const plane = useRef(new THREE.Plane());
  const intersection = useRef(new THREE.Vector3());
  
  // Group overlapping vertices together
  const vertexGroups = [];
  const worldMatrix = object.matrixWorld;
  const tolerance = 0.001; // Tolerance for considering vertices as overlapping
  
  for (let i = 0; i < positions.count; i++) {
    const vertex = new THREE.Vector3(
      positions.getX(i),
      positions.getY(i),
      positions.getZ(i)
    );
    
    // Find if this vertex belongs to an existing group (overlapping)
    let foundGroup = false;
    for (const group of vertexGroups) {
      const groupVertex = new THREE.Vector3(
        positions.getX(group.indices[0]),
        positions.getY(group.indices[0]),
        positions.getZ(group.indices[0])
      );
      
      if (vertex.distanceTo(groupVertex) < tolerance) {
        group.indices.push(i);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      // Create new group for this vertex
      const worldVertex = vertex.clone().applyMatrix4(worldMatrix);
      vertexGroups.push({
        indices: [i],
        worldPosition: worldVertex,
        localPosition: vertex.clone()
      });
    }
  }

  // Handle vertex dragging
  useEffect(() => {
    if (!isDragging || !draggedVertexGroup || editMode !== 'vertex') return;

    const handlePointerMove = (event) => {
      // Set up a plane perpendicular to camera for dragging
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      
      // Use the current world position of the dragged vertex group
      const currentWorldPos = new THREE.Vector3(
        positions.getX(draggedVertexGroup[0]),
        positions.getY(draggedVertexGroup[0]),
        positions.getZ(draggedVertexGroup[0])
      ).applyMatrix4(worldMatrix);
      
      plane.current.setFromNormalAndCoplanarPoint(cameraDirection, currentWorldPos);

      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
        // Convert world position back to local space
        const localPosition = intersection.current.clone().applyMatrix4(worldMatrix.clone().invert());
        
        // Update all vertices in the group
        draggedVertexGroup.forEach(vertexIndex => {
          positions.setXYZ(vertexIndex, localPosition.x, localPosition.y, localPosition.z);
        });
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Update wireframe if it exists
        updateWireframeForGeometry(object, geometry);
        
        // Update the store with the new world position
        updateVertexDrag(intersection.current);
      }
    };

    const handleMouseUp = (event) => {
      if (event.button === 0) { // Left click only
        setIsDragging(false);
        setDraggedVertexGroup(null);
        endVertexDrag();
      }
    };

    const handleRightClick = (event) => {
      if (event.button === 2) { // Right click
        event.preventDefault();
        setIsDragging(false);
        setDraggedVertexGroup(null);
        endVertexDrag();
        // Clear vertex selection
        setSelectedElements({ vertices: [], edges: [], faces: [] });
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDragging(false);
        setDraggedVertexGroup(null);
        endVertexDrag();
        // Clear vertex selection on Escape
        setSelectedElements({ vertices: [], edges: [], faces: [] });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleRightClick);
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleRightClick);
      window.removeEventListener('contextmenu', (e) => e.preventDefault());
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, draggedVertexGroup, camera, raycaster, pointer, editMode, worldMatrix, positions, geometry]);

  // Handle right-click on vertex points to clear selection
  const handleVertexRightClick = (e, groupIndices) => {
    e.stopPropagation();
    if (e.nativeEvent && e.nativeEvent.button === 2) { // Right click
      e.nativeEvent.preventDefault();
      // Clear vertex selection
      setSelectedElements({ vertices: [], edges: [], faces: [] });
      // Stop any dragging
      setIsDragging(false);
      setDraggedVertexGroup(null);
      endVertexDrag();
    }
  };
  return editMode === 'vertex' ? (
    <group>
      {vertexGroups.map((group, groupIndex) => {
        const isSelected = selectedElements.vertices.some(selectedIndex => 
          group.indices.includes(selectedIndex)
        );
        const isDraggedGroup = draggedVertexGroup && 
          draggedVertexGroup.some(dragIndex => group.indices.includes(dragIndex));
        
        return (
        <mesh
          key={groupIndex}
          position={group.worldPosition}
          onClick={(e) => {
            e.stopPropagation();
            if (editMode === 'vertex') {
              // Start dragging this vertex group
              setIsDragging(true);
              setDraggedVertexGroup(group.indices);
              startVertexDrag(group.indices[0], group.worldPosition);
            }
          }}
          onContextMenu={(e) => handleVertexRightClick(e, group.indices)}
        >
          <sphereGeometry args={[group.indices.length > 1 ? 0.08 : 0.05]} />
          <meshBasicMaterial
            color={isSelected || isDraggedGroup ? 'red' : (group.indices.length > 1 ? 'orange' : 'yellow')}
            transparent
            opacity={group.indices.length > 1 ? 0.8 : 0.6}
          />
        </mesh>
        );
      })}
    </group>
  ) : null;
};

const EdgeLines = ({ geometry, object }) => {
  const { editMode, draggedEdge, startEdgeDrag, isDraggingEdge, setIsDraggingEdge, endEdgeDrag } = useSceneStore();
  const { camera, raycaster, pointer } = useThree();
  const positions = geometry.attributes.position;
  const edges = [];
  const worldMatrix = object.matrixWorld;
  const plane = useRef(new THREE.Plane());
  const intersection = useRef(new THREE.Vector3());
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Get all edges including vertical ones
  const indices = geometry.index ? Array.from(geometry.index.array) : null;
  
  if (indices) {
    // For indexed geometry
    for (let i = 0; i < indices.length; i += 3) {
      const addEdge = (a: number, b: number) => {
        const v1 = new THREE.Vector3(
          positions.getX(indices[a]),
          positions.getY(indices[a]),
          positions.getZ(indices[a])
        ).applyMatrix4(worldMatrix);

        const v2 = new THREE.Vector3(
          positions.getX(indices[b]),
          positions.getY(indices[b]),
          positions.getZ(indices[b])
        ).applyMatrix4(worldMatrix);

        const midpoint = v1.clone().add(v2).multiplyScalar(0.5);

        edges.push({
          vertices: [indices[a], indices[b]],
          positions: [v1, v2],
          midpoint
        });
      };

      // Add all three edges of the triangle
      addEdge(i, i + 1);
      addEdge(i + 1, i + 2);
      addEdge(i + 2, i);
    }
  } else {
    // For non-indexed geometry
    for (let i = 0; i < positions.count; i += 3) {
      const addEdge = (a: number, b: number) => {
        const v1 = new THREE.Vector3(
          positions.getX(a),
          positions.getY(a),
          positions.getZ(a)
        ).applyMatrix4(worldMatrix);

        const v2 = new THREE.Vector3(
          positions.getX(b),
          positions.getY(b),
          positions.getZ(b)
        ).applyMatrix4(worldMatrix);

        const midpoint = v1.clone().add(v2).multiplyScalar(0.5);

        edges.push({
          vertices: [a, b],
          positions: [v1, v2],
          midpoint
        });
      };

      // Add all three edges of the triangle
      addEdge(i, i + 1);
      addEdge(i + 1, i + 2);
      addEdge(i + 2, i);
    }
  }

  useEffect(() => {
    if (!isDraggingEdge || !draggedEdge || editMode !== 'edge') return;

    const handlePointerMove = (event) => {
      // Set up a plane perpendicular to camera for dragging
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      plane.current.setFromNormalAndCoplanarPoint(cameraDirection, draggedEdge.midpoint);

      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
        useSceneStore.getState().updateEdgeDrag(intersection.current);
      }
    };

    const handleMouseUp = (event) => {
      if (event.button === 2) { // Right click only
        event.preventDefault();
        setIsDraggingEdge(false);
        useSceneStore.getState().endEdgeDrag();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDraggingEdge(false);
        useSceneStore.getState().endEdgeDrag();
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDraggingEdge, draggedEdge, camera, raycaster, pointer, editMode]);

  const handleEdgeClick = (vertices: [number, number], positions: [THREE.Vector3, THREE.Vector3], midpoint: THREE.Vector3) => {
    // This will be handled by onPointerDown with proper button detection
  };

  const handleEdgePointerDown = (event, vertices: [number, number], positions: [THREE.Vector3, THREE.Vector3], midpoint: THREE.Vector3) => {
    event.stopPropagation();
    
    if (event.button === 0) { // Left click only
      if (isDraggingEdge) return;

      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);

      if (clickTimer) {
        clearTimeout(clickTimer);
        setClickTimer(null);
      }

      if (newClickCount === 1) {
        // First click - start timer for double click detection
        const timer = setTimeout(() => {
          setClickCount(0);
          setClickTimer(null);
        }, 300);
        setClickTimer(timer);
      } else if (newClickCount === 2) {
        // Double click detected - start edge dragging
        setClickCount(0);
        if (clickTimer) {
          clearTimeout(clickTimer);
          setClickTimer(null);
        }
        setIsDraggingEdge(true);
        useSceneStore.getState().startEdgeDrag(vertices, positions, midpoint);
      }
    } else if (event.button === 2) { // Right click
      event.nativeEvent.preventDefault();
      if (isDraggingEdge) {
        // Release edge dragging
        setIsDraggingEdge(false);
        useSceneStore.getState().endEdgeDrag();
      }
    }
  };

  return editMode === 'edge' ? (
    <group>
      {edges.map(({ vertices: [v1, v2], positions: [p1, p2], midpoint }, i) => {
        const points = [p1, p2];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const isSelected = draggedEdge?.indices && 
          draggedEdge.indices.length >= 2 && 
          ((draggedEdge.indices[0] === v1 && draggedEdge.indices[1] === v2) || 
           (draggedEdge.indices[0] === v2 && draggedEdge.indices[1] === v1));
        
        return (
          <group key={i}>
            <line geometry={geometry}>
              <lineBasicMaterial
                color={isSelected ? 'red' : 'yellow'}
                linewidth={2}
              />
            </line>
            <mesh
              position={midpoint}
              onPointerDown={(e) => handleEdgePointerDown(e, [v1, v2], [p1, p2], midpoint)}
             onContextMenu={(e) => e.nativeEvent.preventDefault()}
            >
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial
                color={isSelected ? 'red' : 'yellow'}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  ) : null;
};

const EditModeOverlay = () => {
  const { 
    selectedObject, 
    editMode,
    setSelectedElements
  } = useSceneStore();

  if (!selectedObject || !editMode || !(selectedObject instanceof THREE.Mesh)) return null;

  return (
    <>
      <VertexPoints geometry={selectedObject.geometry} object={selectedObject} />
      <EdgeLines geometry={selectedObject.geometry} object={selectedObject} />
    </>
  );
};

// Camera controller for presentation mode
const CameraController = () => {
  const { 
    slides, 
    currentSlideIndex, 
    isCameraLocked, 
    isPlaying,
    presentationSettings,
    updateCurrentCameraState,
    cameraPerspective,
    cameraTarget,
    cameraZoom
  } = useSceneStore();
  
  const { camera, controls } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Update camera state tracking
  useFrame(() => {
    if (!isCameraLocked && controls) {
      updateCurrentCameraState({
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
        target: {
          x: controls.target.x,
          y: controls.target.y,
          z: controls.target.z
        }
      });
    }
  });

  // Handle camera perspective changes
  useEffect(() => {
    if (isCameraLocked || !controls) return;

    const distance = 8 * cameraZoom;
    let newPosition: THREE.Vector3;
    let newTarget = cameraTarget.clone();

    switch (cameraPerspective) {
      case 'front':
        newPosition = new THREE.Vector3(0, 0, distance);
        break;
      case 'back':
        newPosition = new THREE.Vector3(0, 0, -distance);
        break;
      case 'right':
        newPosition = new THREE.Vector3(distance, 0, 0);
        break;
      case 'left':
        newPosition = new THREE.Vector3(-distance, 0, 0);
        break;
      case 'top':
        newPosition = new THREE.Vector3(0, distance, 0);
        break;
      case 'bottom':
        newPosition = new THREE.Vector3(0, -distance, 0);
        break;
      case 'perspective':
      default:
        newPosition = new THREE.Vector3(5 * cameraZoom, 5 * cameraZoom, 5 * cameraZoom);
        break;
    }

    // Smooth transition to new position
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    let progress = 0;
    
    const animate = () => {
      progress += 0.05;
      if (progress >= 1) {
        camera.position.copy(newPosition);
        controls.target.copy(newTarget);
        controls.update();
        return;
      }
      
      camera.position.lerpVectors(startPosition, newPosition, progress);
      controls.target.lerpVectors(startTarget, newTarget, progress);
      controls.update();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [cameraPerspective, cameraTarget, cameraZoom, isCameraLocked]);

  // Handle slide transitions
  useEffect(() => {
    if (!isCameraLocked || !slides[currentSlideIndex] || !controls) return;

    const currentSlide = slides[currentSlideIndex];
    const targetPosition = new THREE.Vector3(
      currentSlide.cameraPosition.x,
      currentSlide.cameraPosition.y,
      currentSlide.cameraPosition.z
    );
    const targetLookAt = new THREE.Vector3(
      currentSlide.cameraTarget.x,
      currentSlide.cameraTarget.y,
      currentSlide.cameraTarget.z
    );

    setIsTransitioning(true);

    // Animate camera to slide position
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    let progress = 0;
    const duration = presentationSettings.slideTransitionDuration;
    
    const animate = () => {
      progress += 1 / (duration * 60); // 60 FPS
      
      if (progress >= 1) {
        camera.position.copy(targetPosition);
        controls.target.copy(targetLookAt);
        controls.update();
        setIsTransitioning(false);
        return;
      }
      
      // Smooth easing
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
      controls.target.lerpVectors(startTarget, targetLookAt, easeProgress);
      controls.update();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [currentSlideIndex, isCameraLocked, slides, presentationSettings.slideTransitionDuration]);

  // Auto-rotation during presentation
  useFrame((state, delta) => {
    if (isPlaying && presentationSettings.autoRotate && controls && !isTransitioning) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    } else if (controls) {
      controls.autoRotate = false;
    }
  });

  return null;
};

// Lighting setup component
const SceneLighting = () => {
  const { lights, sceneSettings } = useSceneStore();

  return (
    <group>
      {/* Ambient light for basic illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Default directional light if no lights exist */}
      {lights.length === 0 && (
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
      )}
      
      {/* User-created lights */}
      {lights.map((light) => {
        if (!light.visible || !light.object) return null;
        
        return (
          <primitive 
            key={light.id} 
            object={light.object}
          />
        );
      })}
      
      {/* Light helpers */}
      <LightHelpers lights={lights} selectedLight={useSceneStore.getState().selectedLight} />
    </group>
  );
};

// Object placement component
const ObjectPlacement = () => {
  const { placementMode, pendingObject, placeObjectAt, cancelObjectPlacement } = useSceneStore();
  const { camera, raycaster, pointer } = useThree();
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)); // Plane at y=0

  useFrame(() => {
    if (placementMode) {
      raycaster.setFromCamera(pointer, camera);
      const intersection = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(groundPlane.current, intersection)) {
        // Force y position to 0 (ground level)
        intersection.y = 0;
        setPreviewPosition(intersection);
      }
    }
  });

  useEffect(() => {
    if (!placementMode) return;

    const handleClick = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        // Ensure object is placed at ground level
        const groundPosition = previewPosition.clone();
        groundPosition.y = 0;
        placeObjectAt(groundPosition);
      } else if (event.button === 2) { // Right click
        event.preventDefault();
        cancelObjectPlacement();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelObjectPlacement();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('contextmenu', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [placementMode, previewPosition, placeObjectAt, cancelObjectPlacement]);

  if (!placementMode || !pendingObject) return null;

  // Create preview object
  const geometryOrGroup = typeof pendingObject.geometry === 'function' 
    ? pendingObject.geometry() 
    : pendingObject.geometry;

  let previewObject: THREE.Object3D;
  
  if (geometryOrGroup instanceof THREE.Group) {
    previewObject = geometryOrGroup.clone();
  } else {
    const material = new THREE.MeshStandardMaterial({ 
      color: pendingObject.color || '#44aa88',
      transparent: true,
      opacity: 0.7
    });
    previewObject = new THREE.Mesh(geometryOrGroup, material);
  }

  return (
    <primitive 
      object={previewObject} 
      position={previewPosition}
    />
  );
};

// Main Scene component
const Scene: React.FC = () => {
  const { 
    objects, 
    selectedObject, 
    setSelectedObject, 
    transformMode, 
    editMode,
    draggedVertex,
    selectedElements,
    updateVertexDrag,
    sceneSettings,
    applicationMode,
    canSelectObject,
    isCameraLocked,
    cameraTarget,
    isDraggingEdge
  } = useSceneStore();
  
  const [selectedPosition, setSelectedPosition] = useState<THREE.Vector3 | null>(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);

  // Handle vertex position updates
  useEffect(() => {
    if (editMode === 'vertex' && selectedObject instanceof THREE.Mesh) {
      if (draggedVertex) {
        // Convert world position to local space for display
        const localPosition = draggedVertex.position.clone().applyMatrix4(selectedObject.matrixWorld.clone().invert());
        setSelectedPosition(draggedVertex.position);
      } else if (selectedElements.vertices.length > 0) {
        const geometry = selectedObject.geometry;
        const positions = geometry.attributes.position;
        const vertexIndex = selectedElements.vertices[0];
        const position = new THREE.Vector3(
          positions.getX(vertexIndex),
          positions.getY(vertexIndex),
          positions.getZ(vertexIndex)
        );
        position.applyMatrix4(selectedObject.matrixWorld);
        setSelectedPosition(position);
      } else {
        setSelectedPosition(null);
      }
    } else {
      setSelectedPosition(null);
    }
  }, [editMode, selectedObject, draggedVertex, selectedElements.vertices]);

  const handlePositionChange = (newPosition: THREE.Vector3) => {
    if (selectedObject instanceof THREE.Mesh && selectedElements.vertices.length > 0) {
      // Convert world position to local space
      const localPosition = newPosition.clone().applyMatrix4(selectedObject.matrixWorld.clone().invert());
      
      // Update all selected vertices (handles overlapping vertices)
      const geometry = selectedObject.geometry;
      const positions = geometry.attributes.position;
      const tolerance = 0.001;
      
      // Find all vertices that overlap with the selected ones
      const verticesToUpdate = new Set<number>();
      
      selectedElements.vertices.forEach(selectedIndex => {
        const selectedPos = new THREE.Vector3(
          positions.getX(selectedIndex),
          positions.getY(selectedIndex),
          positions.getZ(selectedIndex)
        );
        
        // Find all vertices at the same position
        for (let i = 0; i < positions.count; i++) {
          const vertexPos = new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
          );
          
          if (vertexPos.distanceTo(selectedPos) < tolerance) {
            verticesToUpdate.add(i);
          }
        }
      });
      
      // Update all overlapping vertices
      verticesToUpdate.forEach(index => {
        positions.setXYZ(index, localPosition.x, localPosition.y, localPosition.z);
      });
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      
      // Update wireframe if it exists
      updateWireframeForGeometry(selectedObject, geometry);
      
      // Update the dragged vertex position in world space for display
      updateVertexDrag(newPosition);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'tab':
          event.preventDefault();
          useSceneStore.getState().updateSceneSettings({ 
            hideAllMenus: !sceneSettings.hideAllMenus 
          });
          break;
        case 'g':
          event.preventDefault();
          useSceneStore.getState().updateSceneSettings({ 
            showGrid: !sceneSettings.showGrid 
          });
          break;
        case 'delete':
        case 'backspace':
          if (selectedObject) {
            const obj = objects.find(o => o.object === selectedObject);
            if (obj && canSelectObject(selectedObject)) {
              useSceneStore.getState().removeObject(obj.id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, objects, sceneSettings.hideAllMenus, sceneSettings.showGrid, canSelectObject]);

  return (
    <div className="relative w-full h-full">
      {/* Hide Interface Button - Always visible */}
      <div className="fixed top-4 left-4 z-50">
        <HideInterfaceButton />
      </div>

      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        className="w-full h-full"
        style={{ backgroundColor: sceneSettings.backgroundColor }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Camera controller */}
          <CameraController />
          
          {/* Lighting */}
          <SceneLighting />
          
          {/* Grid */}
          {sceneSettings.showGrid && applicationMode === 'modeling' && (
            <group position={[0, -0.5, 0]}>
              <Grid
                infiniteGrid
                cellSize={1}
                sectionSize={sceneSettings.gridSize / 4}
                fadeDistance={sceneSettings.gridSize * 2}
                fadeStrength={1}
                cellColor="#ffffff"
                sectionColor="#4a90e2"
                cellThickness={0.5}
                sectionThickness={1}
              />
            </group>
          )}

          {/* Scene objects */}
          {objects.map(({ object, visible, id }) => (
            visible && (
              <primitive
                key={id}
                object={object}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canSelectObject(object)) {
                    setSelectedObject(object);
                  }
                }}
              />
            )
          ))}

          {/* Transform controls */}
          {selectedObject && transformMode && canSelectObject(selectedObject) && (
            <TransformControls
              object={selectedObject}
              mode={transformMode}
              showX={true}
              showY={true}
              showZ={true}
              enabled={true}
              onObjectChange={() => {
                // Update object properties when transform changes
                useSceneStore.getState().updateObjectProperties();
              }}
            />
          )}

          {/* Edit mode overlay with vertex and edge tools */}
          <EditModeOverlay />

          {/* Object placement preview */}
          <ObjectPlacement />
          
          {/* Slide terrain (presentation mode) */}
          {applicationMode === 'presentation' && <SlideTerrain />}
          
          {/* Slide annotations (presentation mode) */}
          {applicationMode === 'presentation' && (
            <SlideAnnotations 
              editingAnnotationId={editingAnnotationId}
              setEditingAnnotationId={setEditingAnnotationId}
            />
          )}

          {/* Orbit controls */}
          <OrbitControls 
            makeDefault
            enabled={!isDraggingEdge && !draggedVertex}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={isCameraLocked ? undefined : cameraTarget}
          />
        </Suspense>
      </Canvas>

      {/* Vertex coordinate editor */}
      {editMode === 'vertex' && selectedPosition && (
        <VertexCoordinates 
          position={selectedPosition}
          onPositionChange={handlePositionChange}
        />
      )}
      
    </div>
  );
};

export default Scene;