import { create } from 'zustand';
import * as THREE from 'three';

// Types
interface SceneObject {
  id: string;
  object: THREE.Object3D;
  name: string;
  visible: boolean;
  locked: boolean;
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
  expanded: boolean;
  visible: boolean;
  locked: boolean;
  objectIds: string[];
}

interface Light {
  id: string;
  name: string;
  type: 'directional' | 'point' | 'spot';
  position: number[];
  target: number[];
  intensity: number;
  color: string;
  visible: boolean;
  castShadow: boolean;
  distance: number;
  decay: number;
  angle: number;
  penumbra: number;
  object?: THREE.Light;
}

interface SceneSettings {
  backgroundColor: string;
  showGrid: boolean;
  gridSize: number;
  gridDivisions: number;
  hideAllMenus: boolean;
  showLightHelpers: boolean;
}

interface PresentationSettings {
  slideTransitionDuration: number;
  autoRotate: boolean;
  showAnnotations: boolean;
}

interface Slide {
  id: string;
  name: string;
  duration: number;
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  annotations: Array<{
    id: string;
    text: string;
    position: { x: number; y: number; z: number };
    screenPosition?: { x: number; y: number };
    fontSize?: number;
    color?: string;
    type?: 'point' | 'text';
  }>;
  terrainType?: 'none' | 'mountains' | 'rocky-desert' | 'rolling-hills' | 'canyon';
}

interface SceneState {
  // Objects and scene
  objects: SceneObject[];
  groups: Group[];
  lights: Light[];
  selectedObject: THREE.Object3D | null;
  selectedLight: Light | null;
  
  // Camera and view
  cameraPerspective: string;
  cameraZoom: number;
  cameraTarget: THREE.Vector3;
  currentCameraState: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  
  // Modes and states
  applicationMode: 'modeling' | 'presentation';
  transformMode: 'translate' | 'rotate' | 'scale' | null;
  editMode: string | null;
  placementMode: boolean;
  pendingObject: any;
  
  // Presentation
  slides: Slide[];
  currentSlideIndex: number;
  isPlaying: boolean;
  isCameraLocked: boolean;
  presentationSettings: PresentationSettings;
  
  // Edit states
  draggedVertex: { index: number; indices: number[]; position: THREE.Vector3 } | null;
  isDraggingEdge: boolean;
  draggedEdge: any;
  selectedElements: {
    vertices: number[];
    edges: number[];
    faces: number[];
  };
  
  // History
  canUndo: boolean;
  canRedo: boolean;
  
  // Settings
  sceneSettings: SceneSettings;
  
  // Actions
  addObject: (object: THREE.Object3D, name: string) => void;
  removeObject: (id: string) => void;
  setSelectedObject: (object: THREE.Object3D | null) => void;
  updateObjectProperties: () => void;
  updateObjectColor: (color: string) => void;
  updateObjectOpacity: (opacity: number) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  updateObjectName: (id: string, name: string) => void;
  isObjectLocked: (id: string) => boolean;
  canSelectObject: (object: THREE.Object3D) => boolean;
  
  // Groups
  createGroup: (name: string, objectIds?: string[]) => void;
  removeGroup: (id: string) => void;
  toggleGroupExpanded: (id: string) => void;
  toggleGroupVisibility: (id: string) => void;
  toggleGroupLock: (id: string) => void;
  updateGroupName: (id: string, name: string) => void;
  moveObjectsToGroup: (objectIds: string[], groupId: string | null) => void;
  removeObjectFromGroup: (objectId: string) => void;
  
  // Lights
  addLight: (type: 'directional' | 'point' | 'spot', position: number[]) => void;
  removeLight: (id: string) => void;
  updateLight: (id: string, updates: Partial<Light>) => void;
  toggleLightVisibility: (id: string) => void;
  setSelectedLight: (light: Light | null) => void;
  
  // Camera
  setCameraPerspective: (perspective: string) => void;
  setCameraTarget: (target: THREE.Vector3) => void;
  updateCurrentCameraState: (state: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } }) => void;
  unlockCamera: () => void;
  
  // Transform and edit
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale' | null) => void;
  setEditMode: (mode: string | null) => void;
  startVertexDrag: (index: number, position: THREE.Vector3) => void;
  updateVertexDrag: (position: THREE.Vector3) => void;
  endVertexDrag: () => void;
  startEdgeDrag: (vertices: [number, number], positions: [THREE.Vector3, THREE.Vector3], midpoint: THREE.Vector3) => void;
  updateEdgeDrag: (position: THREE.Vector3) => void;
  endEdgeDrag: () => void;
  setIsDraggingEdge: (dragging: boolean) => void;
  setSelectedElements: (elements: { vertices: number[]; edges: number[]; faces: number[] }) => void;
  updateCylinderVertices: (count: number) => void;
  updateSphereVertices: (count: number) => void;
  
  // Edge transformation functions
  extrudeFace: (distance: number) => void;
  bevelEdge: (segments: number, size: number) => void;
  
  // Placement
  startObjectPlacement: (objectFactory: any) => void;
  placeObjectAt: (position: THREE.Vector3, rotation?: THREE.Euler | null) => void;
  cancelObjectPlacement: () => void;
  
  // Actions
  undo: () => void;
  redo: () => void;
  duplicateObject: () => void;
  mirrorObject: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  
  // Application mode
  setApplicationMode: (mode: 'modeling' | 'presentation') => void;
  
  // Presentation
  addSlide: (name: string) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  playPresentation: () => void;
  pausePresentation: () => void;
  stopPresentation: () => void;
  updatePresentationSettings: (settings: Partial<PresentationSettings>) => void;
  captureCurrentView: (slideId: string) => void;
  addAnnotation: (slideId: string, text: string, position: { x: number; y: number; z: number }) => void;
  addTextAnnotation: (slideId: string, text: string, position: { x: number; y: number; z: number }) => void;
  removeAnnotation: (slideId: string, annotationId: string) => void;
  updateTextAnnotation: (slideId: string, annotationId: string, updates: any) => void;
  updateSlideBackground: (slideId: string, terrainType: 'none' | 'mountains' | 'rocky-desert' | 'rolling-hills' | 'canyon') => void;
  
  // Settings
  updateSceneSettings: (settings: Partial<SceneSettings>) => void;
  
  // Student/Project management
  loadProjectData: (projectData: any) => Promise<void>;
  clearScene: () => void;
  resetToInitialState: () => void;
  loadProjectFromData: (project: any) => Promise<void>;
}

// Define initial state as a constant to reuse
const initialState = {
  objects: [],
  groups: [],
  lights: [],
  selectedObject: null,
  selectedLight: null,
  
  // Camera and view
  cameraPerspective: 'perspective',
  cameraZoom: 1,
  cameraTarget: new THREE.Vector3(0, 0, 0),
  currentCameraState: {
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 }
  },
  
  // Modes and states
  applicationMode: 'modeling' as const,
  transformMode: null,
  editMode: null,
  placementMode: false,
  pendingObject: null,
  
  // Presentation
  slides: [],
  currentSlideIndex: 0,
  isPlaying: false,
  isCameraLocked: false,
  presentationSettings: {
    slideTransitionDuration: 2,
    autoRotate: false,
    showAnnotations: true
  },
  
  // Edit states
  draggedVertex: null,
  isDraggingEdge: false,
  draggedEdge: null,
  selectedElements: {
    vertices: [],
    edges: [],
    faces: []
  },
  
  // History
  canUndo: false,
  canRedo: false,
  
  // Settings
  sceneSettings: {
    backgroundColor: '#0f0f23',
    showGrid: true,
    gridSize: 20,
    gridDivisions: 20,
    hideAllMenus: false,
    showLightHelpers: false
  }
};

export const useSceneStore = create<SceneState>((set, get) => ({
  // Use initial state
  ...initialState,
  
  // Object management
  addObject: (object, name) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Store geometry parameters in the object's userData for proper saving/loading
    if (object instanceof THREE.Mesh) {
      const geometryParams = get().extractGeometryParams(object.geometry);
      object.userData = {
        ...object.userData,
        geometryParams
      };
    } else if (object instanceof THREE.Group && object.userData?.shapeType) {
      // For custom shapes that are groups, ensure the shape type is preserved
      object.userData = {
        ...object.userData,
        geometryParams: {
          type: 'custom',
          shapeType: object.userData.shapeType,
          parameters: object.userData.parameters || {}
        }
      };
    }
    
    set((state) => ({
      objects: [...state.objects, {
        id,
        object,
        name,
        visible: true,
        locked: false
      }]
    }));
  },
  
  removeObject: (id) => {
    set((state) => ({
      objects: state.objects.filter(obj => obj.id !== id),
      selectedObject: state.selectedObject && state.objects.find(obj => obj.id === id)?.object === state.selectedObject ? null : state.selectedObject
    }));
  },
  
  setSelectedObject: (object) => {
    set({ selectedObject: object });
  },
  
  updateObjectProperties: () => {
    // Trigger re-render
    set((state) => ({ ...state }));
  },
  
  updateObjectColor: (color) => {
    const { selectedObject } = get();
    if (selectedObject instanceof THREE.Mesh && selectedObject.material instanceof THREE.MeshStandardMaterial) {
      selectedObject.material.color.setStyle(color);
      get().updateObjectProperties();
    }
  },
  
  updateObjectOpacity: (opacity) => {
    const { selectedObject } = get();
    if (selectedObject instanceof THREE.Mesh && selectedObject.material instanceof THREE.MeshStandardMaterial) {
      selectedObject.material.opacity = opacity;
      selectedObject.material.transparent = opacity < 1;
      get().updateObjectProperties();
    }
  },
  
  toggleVisibility: (id) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === id 
          ? { ...obj, visible: !obj.visible, object: { ...obj.object, visible: !obj.visible } }
          : obj
      )
    }));
  },
  
  toggleLock: (id) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === id ? { ...obj, locked: !obj.locked } : obj
      )
    }));
  },
  
  updateObjectName: (id, name) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === id ? { ...obj, name } : obj
      )
    }));
  },
  
  isObjectLocked: (id) => {
    const obj = get().objects.find(o => o.id === id);
    if (!obj) return false;
    
    // Check if object itself is locked
    if (obj.locked) return true;
    
    // Check if object is in a locked group
    if (obj.groupId) {
      const group = get().groups.find(g => g.id === obj.groupId);
      return group?.locked || false;
    }
    
    return false;
  },
  
  canSelectObject: (object) => {
    const obj = get().objects.find(o => o.object === object);
    return obj ? !get().isObjectLocked(obj.id) : true;
  },
  
  // Group management
  createGroup: (name, objectIds = []) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      groups: [...state.groups, {
        id,
        name,
        expanded: true,
        visible: true,
        locked: false,
        objectIds
      }],
      objects: state.objects.map(obj => 
        objectIds.includes(obj.id) ? { ...obj, groupId: id } : obj
      )
    }));
  },
  
  removeGroup: (id) => {
    set((state) => ({
      groups: state.groups.filter(group => group.id !== id),
      objects: state.objects.map(obj => 
        obj.groupId === id ? { ...obj, groupId: undefined } : obj
      )
    }));
  },
  
  toggleGroupExpanded: (id) => {
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === id ? { ...group, expanded: !group.expanded } : group
      )
    }));
  },
  
  toggleGroupVisibility: (id) => {
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === id ? { ...group, visible: !group.visible } : group
      )
    }));
  },
  
  toggleGroupLock: (id) => {
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === id ? { ...group, locked: !group.locked } : group
      )
    }));
  },
  
  updateGroupName: (id, name) => {
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === id ? { ...group, name } : group
      )
    }));
  },
  
  moveObjectsToGroup: (objectIds, groupId) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        objectIds.includes(obj.id) ? { ...obj, groupId } : obj
      ),
      groups: state.groups.map(group => ({
        ...group,
        objectIds: groupId === group.id 
          ? [...new Set([...group.objectIds, ...objectIds])]
          : group.objectIds.filter(id => !objectIds.includes(id))
      }))
    }));
  },
  
  removeObjectFromGroup: (objectId) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === objectId ? { ...obj, groupId: undefined } : obj
      ),
      groups: state.groups.map(group => ({
        ...group,
        objectIds: group.objectIds.filter(id => id !== objectId)
      }))
    }));
  },
  
  // Light management
  addLight: (type, position) => {
    const id = Math.random().toString(36).substr(2, 9);
    let light: THREE.Light;
    
    switch (type) {
      case 'directional':
        light = new THREE.DirectionalLight('#ffffff', 1);
        light.position.set(...position);
        light.target.position.set(0, 0, 0);
        break;
      case 'point':
        light = new THREE.PointLight('#ffffff', 1, 0, 2);
        light.position.set(...position);
        break;
      case 'spot':
        light = new THREE.SpotLight('#ffffff', 1, 0, Math.PI / 3, 0, 2);
        light.position.set(...position);
        light.target.position.set(0, 0, 0);
        break;
      default:
        return;
    }
    
    const lightData: Light = {
      id,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Light`,
      type,
      position,
      target: [0, 0, 0],
      intensity: 1,
      color: '#ffffff',
      visible: true,
      castShadow: false,
      distance: 0,
      decay: 2,
      angle: Math.PI / 3,
      penumbra: 0,
      object: light
    };
    
    set((state) => ({
      lights: [...state.lights, lightData]
    }));
  },
  
  removeLight: (id) => {
    set((state) => ({
      lights: state.lights.filter(light => light.id !== id),
      selectedLight: state.selectedLight?.id === id ? null : state.selectedLight
    }));
  },
  
  updateLight: (id, updates) => {
    set((state) => ({
      lights: state.lights.map(light => {
        if (light.id === id) {
          const updatedLight = { ...light, ...updates };
          
          // Update the THREE.js light object
          if (light.object) {
            if (updates.position) {
              light.object.position.set(...updates.position);
            }
            if (updates.intensity !== undefined) {
              light.object.intensity = updates.intensity;
            }
            if (updates.color) {
              light.object.color.setStyle(updates.color);
            }
            if (updates.visible !== undefined) {
              light.object.visible = updates.visible;
            }
            if (updates.castShadow !== undefined) {
              light.object.castShadow = updates.castShadow;
            }
            
            // Type-specific updates
            if (light.object instanceof THREE.PointLight || light.object instanceof THREE.SpotLight) {
              if (updates.distance !== undefined) {
                light.object.distance = updates.distance;
              }
              if (updates.decay !== undefined) {
                light.object.decay = updates.decay;
              }
            }
            
            if (light.object instanceof THREE.SpotLight) {
              if (updates.angle !== undefined) {
                light.object.angle = updates.angle;
              }
              if (updates.penumbra !== undefined) {
                light.object.penumbra = updates.penumbra;
              }
            }
            
            if (light.object instanceof THREE.DirectionalLight || light.object instanceof THREE.SpotLight) {
              if (updates.target) {
                light.object.target.position.set(...updates.target);
              }
            }
          }
          
          return updatedLight;
        }
        return light;
      })
    }));
  },
  
  toggleLightVisibility: (id) => {
    const light = get().lights.find(l => l.id === id);
    if (light) {
      get().updateLight(id, { visible: !light.visible });
    }
  },
  
  setSelectedLight: (light) => {
    set({ selectedLight: light });
  },
  
  // Camera controls
  setCameraPerspective: (perspective) => {
    set({ cameraPerspective: perspective });
  },
  
  setCameraTarget: (target) => {
    set({ cameraTarget: target });
  },
  
  updateCurrentCameraState: (state) => {
    set({ currentCameraState: state });
  },
  
  unlockCamera: () => {
    set({ isCameraLocked: false });
  },
  
  // Transform and edit modes
  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },
  
  setEditMode: (mode) => {
    set({ editMode: mode });
  },
  
  // Vertex editing
  startVertexDrag: (index, position) => {
    const indices = Array.isArray(index) ? index : [index];
    set({
      draggedVertex: { index: indices[0], indices, position },
      selectedElements: { 
        vertices: indices, 
        edges: [], 
        faces: [] 
      }
    });
  },
  
  updateVertexDrag: (position) => {
    // Update the dragged vertex position in the store
    const { draggedVertex } = get();
    if (draggedVertex) {
      set({
        draggedVertex: { ...draggedVertex, position }
      });
    }
  },
  
  endVertexDrag: () => {
    const { selectedObject } = get();
    if (selectedObject instanceof THREE.Mesh) {
      const geometry = selectedObject.geometry;
      const wireframeObj = (selectedObject as any).userData?.wireframeObject;
      const wireframeMat = (selectedObject as any).userData?.wireframeMaterial;
      
      // Update wireframe if it exists
      if (wireframeObj && wireframeMat) {
        // Remove old wireframe
        selectedObject.remove(wireframeObj);
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
        const edgesGeom = new THREE.EdgesGeometry(geometry);
        const newWireframeObj = new THREE.LineSegments(edgesGeom, wireframeMat);
        newWireframeObj.visible = wireframeObj.visible;
        (selectedObject as any).userData.wireframeObject = newWireframeObj;
        selectedObject.add(newWireframeObj);
      }
    }
    set({ draggedVertex: null });
  },
  
  // Edge editing
  startEdgeDrag: (vertices, positions, midpoint) => {
    set({
      draggedEdge: { indices: vertices, positions, midpoint }
    });
  },
  
  updateEdgeDrag: (position) => {
    const { selectedObject, draggedEdge } = get();
    if (selectedObject instanceof THREE.Mesh && draggedEdge) {
      const geometry = selectedObject.geometry;
      const positions = geometry.attributes.position;
      const indices = geometry.index;
      
      if (!indices) return;
      
      // Convert mouse position from world space to local space
      const worldToLocal = selectedObject.matrixWorld.clone().invert();
      const localPosition = position.clone().applyMatrix4(worldToLocal);
      
      // Calculate the offset from the original edge midpoint
      const originalMidpoint = draggedEdge.positions[0].clone().add(draggedEdge.positions[1]).multiplyScalar(0.5);
      const worldToLocalMatrix = selectedObject.matrixWorld.clone().invert();
      const originalLocalMidpoint = originalMidpoint.clone().applyMatrix4(worldToLocalMatrix);
      const offset = localPosition.clone().sub(originalLocalMidpoint);
      
      // Find all vertices that share the same position as the edge vertices
      const [v1Index, v2Index] = draggedEdge.indices;
      const tolerance = 0.0001;
      
      // Get original edge vertex positions
      const v1Pos = new THREE.Vector3(positions.getX(v1Index), positions.getY(v1Index), positions.getZ(v1Index));
      const v2Pos = new THREE.Vector3(positions.getX(v2Index), positions.getY(v2Index), positions.getZ(v2Index));
      
      // Find all vertices that share the same position as v1 and v2 (welded vertices)
      const v1Duplicates: number[] = [];
      const v2Duplicates: number[] = [];
      
      for (let i = 0; i < positions.count; i++) {
        const vertexPos = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
        
        if (vertexPos.distanceTo(v1Pos) < tolerance) {
          v1Duplicates.push(i);
        } else if (vertexPos.distanceTo(v2Pos) < tolerance) {
          v2Duplicates.push(i);
        }
      }
      
      // Apply offset to all duplicate vertices to maintain topology
      const newV1 = v1Pos.clone().add(offset);
      const newV2 = v2Pos.clone().add(offset);
      
      // Update all vertices that share the same position as v1
      v1Duplicates.forEach(index => {
        positions.setXYZ(index, newV1.x, newV1.y, newV1.z);
      });
      
      // Update all vertices that share the same position as v2
      v2Duplicates.forEach(index => {
        positions.setXYZ(index, newV2.x, newV2.y, newV2.z);
      });
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      
      // Update wireframe if it exists
      const wireframeObj = (selectedObject as any).userData?.wireframeObject;
      const wireframeMat = (selectedObject as any).userData?.wireframeMaterial;
      const wireframeLinewidth = (selectedObject as any).userData?.wireframeLinewidth ?? 1;
      
      if (wireframeObj && wireframeMat) {
        // Remove old wireframe
        selectedObject.remove(wireframeObj);
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
        const edgesGeom = new THREE.EdgesGeometry(geometry);
        const newWireframeObj = new THREE.LineSegments(edgesGeom, wireframeMat);
        newWireframeObj.visible = wireframeObj.visible;
        (selectedObject as any).userData.wireframeObject = newWireframeObj;
        selectedObject.add(newWireframeObj);
      }
      
      // Update the dragged edge state with new world positions
      const localToWorld = selectedObject.matrixWorld;
      const newWorldV1 = newV1.clone().applyMatrix4(localToWorld);
      const newWorldV2 = newV2.clone().applyMatrix4(localToWorld);
      
      set((state) => ({
        draggedEdge: state.draggedEdge ? { 
          ...state.draggedEdge, 
          midpoint: newWorldV1.clone().add(newWorldV2).multiplyScalar(0.5),
          positions: [
            newWorldV1,
            newWorldV2
          ]
        } : null
      }));
    }
  },
  
  endEdgeDrag: () => {
    const { selectedObject } = get();
    if (selectedObject instanceof THREE.Mesh) {
      const geometry = selectedObject.geometry;
      const wireframeObj = (selectedObject as any).userData?.wireframeObject;
      const wireframeMat = (selectedObject as any).userData?.wireframeMaterial;
      
      // Update wireframe if it exists
      if (wireframeObj && wireframeMat) {
        // Remove old wireframe
        selectedObject.remove(wireframeObj);
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
        const edgesGeom = new THREE.EdgesGeometry(geometry);
        const newWireframeObj = new THREE.LineSegments(edgesGeom, wireframeMat);
        newWireframeObj.visible = wireframeObj.visible;
        (selectedObject as any).userData.wireframeObject = newWireframeObj;
        selectedObject.add(newWireframeObj);
      }
    }
    set({ draggedEdge: null });
  },
  
  setIsDraggingEdge: (dragging) => {
    set({ isDraggingEdge: dragging });
  },
  
  setSelectedElements: (elements) => {
    set({ 
      selectedElements: {
        vertices: Array.isArray(elements.vertices) ? elements.vertices : [elements.vertices].filter(v => v !== undefined),
        edges: Array.isArray(elements.edges) ? elements.edges : [elements.edges].filter(e => e !== undefined),
        faces: Array.isArray(elements.faces) ? elements.faces : [elements.faces].filter(f => f !== undefined)
      }
    });
  },
  
  // Geometry updates
  updateCylinderVertices: (count) => {
    const { selectedObject } = get();
    if (selectedObject instanceof THREE.Mesh && selectedObject.geometry instanceof THREE.CylinderGeometry) {
      const params = selectedObject.geometry.parameters;
      const newGeometry = new THREE.CylinderGeometry(
        params.radiusTop,
        params.radiusBottom,
        params.height,
        count
      );
      selectedObject.geometry.dispose();
      selectedObject.geometry = newGeometry;
      get().updateObjectProperties();
    }
  },
  
  updateSphereVertices: (count) => {
    const { selectedObject } = get();
    if (selectedObject instanceof THREE.Mesh && selectedObject.geometry instanceof THREE.SphereGeometry) {
      const params = selectedObject.geometry.parameters;
      const newGeometry = new THREE.SphereGeometry(
        params.radius,
        count,
        params.heightSegments
      );
      selectedObject.geometry.dispose();
      selectedObject.geometry = newGeometry;
      get().updateObjectProperties();
    }
  },
  
  // Edge transformation functions
  extrudeFace: (distance) => {
    const { selectedObject, selectedElements } = get();
    if (!(selectedObject instanceof THREE.Mesh) || selectedElements.faces.length === 0) {
      console.warn('No faces selected for extrusion');
      return;
    }

    const geometry = selectedObject.geometry;
    const positions = geometry.attributes.position;
    const indices = geometry.index;
    
    if (!indices) {
      console.warn('Geometry must be indexed for face extrusion');
      return;
    }

    // Create a new geometry with extruded faces
    const newPositions: number[] = [];
    const newIndices: number[] = [];
    const vertexMap = new Map<number, number>();
    let newVertexIndex = 0;

    // Copy existing vertices
    for (let i = 0; i < positions.count; i++) {
      newPositions.push(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      vertexMap.set(i, newVertexIndex++);
    }

    // Process each selected face for extrusion
    selectedElements.faces.forEach(faceIndex => {
      const faceStart = faceIndex * 3;
      const v1 = indices.getX(faceStart);
      const v2 = indices.getX(faceStart + 1);
      const v3 = indices.getX(faceStart + 2);

      // Calculate face normal
      const p1 = new THREE.Vector3(positions.getX(v1), positions.getY(v1), positions.getZ(v1));
      const p2 = new THREE.Vector3(positions.getX(v2), positions.getY(v2), positions.getZ(v2));
      const p3 = new THREE.Vector3(positions.getX(v3), positions.getY(v3), positions.getZ(v3));
      
      const normal = new THREE.Vector3()
        .crossVectors(p2.clone().sub(p1), p3.clone().sub(p1))
        .normalize();

      // Create extruded vertices
      const extrudedV1 = newVertexIndex++;
      const extrudedV2 = newVertexIndex++;
      const extrudedV3 = newVertexIndex++;

      // Add extruded vertices
      const offset = normal.multiplyScalar(distance);
      newPositions.push(
        p1.x + offset.x, p1.y + offset.y, p1.z + offset.z,
        p2.x + offset.x, p2.y + offset.y, p2.z + offset.z,
        p3.x + offset.x, p3.y + offset.y, p3.z + offset.z
      );

      // Add side faces (quads as two triangles each)
      // Side 1: v1-v2-extrudedV2-extrudedV1
      newIndices.push(v1, v2, extrudedV2);
      newIndices.push(v1, extrudedV2, extrudedV1);
      
      // Side 2: v2-v3-extrudedV3-extrudedV2
      newIndices.push(v2, v3, extrudedV3);
      newIndices.push(v2, extrudedV3, extrudedV2);
      
      // Side 3: v3-v1-extrudedV1-extrudedV3
      newIndices.push(v3, v1, extrudedV1);
      newIndices.push(v3, extrudedV1, extrudedV3);

      // Add top face (extruded face)
      newIndices.push(extrudedV1, extrudedV3, extrudedV2);
    });

    // Copy non-selected faces
    for (let i = 0; i < indices.count; i += 3) {
      const faceIndex = Math.floor(i / 3);
      if (!selectedElements.faces.includes(faceIndex)) {
        newIndices.push(
          vertexMap.get(indices.getX(i))!,
          vertexMap.get(indices.getX(i + 1))!,
          vertexMap.get(indices.getX(i + 2))!
        );
      }
    }

    // Create new geometry
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();

    // Replace the old geometry
    selectedObject.geometry.dispose();
    selectedObject.geometry = newGeometry;
    
    // Clear selection after extrusion
    get().setSelectedElements({ vertices: [], edges: [], faces: [] });
    get().updateObjectProperties();
  },

  bevelEdge: (segments, size) => {
    const { selectedObject, selectedElements } = get();
    
    if (!(selectedObject instanceof THREE.Mesh) || selectedElements.edges.length === 0) {
      console.warn('No edges selected for beveling');
      return;
    }

    const geometry = selectedObject.geometry;
    const positions = geometry.attributes.position;
    const indices = geometry.index;
    
    if (!indices) {
      console.warn('Geometry must be indexed for edge beveling');
      return;
    }

    // Create a new geometry with beveled edges
    const newPositions: number[] = [];
    const newIndices: number[] = [];
    let newVertexIndex = 0;
    
    // Copy existing vertices first
    for (let i = 0; i < positions.count; i++) {
      newPositions.push(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      newVertexIndex++;
    }
    
    // Process each selected edge for beveling
    selectedElements.edges.forEach(edgeIndex => {
      // Find the edge vertices (this is a simplified approach)
      // In a real implementation, you'd need to properly identify edge vertices from the geometry
      const v1Index = edgeIndex * 2;
      const v2Index = edgeIndex * 2 + 1;
      
      if (v1Index < positions.count && v2Index < positions.count) {
        const v1 = new THREE.Vector3(
          positions.getX(v1Index),
          positions.getY(v1Index),
          positions.getZ(v1Index)
        );
        const v2 = new THREE.Vector3(
          positions.getX(v2Index),
          positions.getY(v2Index),
          positions.getZ(v2Index)
        );

        // Calculate edge direction and perpendicular
        const edgeDir = v2.clone().sub(v1).normalize();
        const perpendicular = new THREE.Vector3(0, 1, 0).cross(edgeDir).normalize();
        
        // Create bevel vertices
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const angle = t * Math.PI;
          const offset = perpendicular.clone().multiplyScalar(Math.sin(angle) * size);
          
          const bevelVertex = v1.clone().lerp(v2, t).add(offset);
          newPositions.push(bevelVertex.x, bevelVertex.y, bevelVertex.z);
          
          // Create faces for the bevel
          if (i > 0) {
            const prevIndex = newVertexIndex - 1;
            const currentIndex = newVertexIndex;
            
            // Add triangular faces for the bevel
            newIndices.push(v1Index, prevIndex, currentIndex);
            newIndices.push(v1Index, currentIndex, v2Index);
          }
          
          newVertexIndex++;
        }
      }
    });
    
    // Copy existing faces that don't involve selected edges
    for (let i = 0; i < indices.count; i += 3) {
      // This is a simplified approach - in practice you'd need to check
      // if the face uses any of the selected edges
      newIndices.push(
        indices.getX(i),
        indices.getX(i + 1),
        indices.getX(i + 2)
      );
    }
    
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();
    
    // Replace the old geometry
    selectedObject.geometry.dispose();
    selectedObject.geometry = newGeometry;
    
    // Clear selection after beveling
    get().setSelectedElements({ vertices: [], edges: [], faces: [] });
    get().updateObjectProperties();
  },

  // Object placement
  startObjectPlacement: (objectFactory) => {
    set({
      placementMode: true,
      pendingObject: objectFactory
    });
  },
  
  placeObjectAt: (position, rotation) => {
    const { pendingObject } = get();
    if (pendingObject) {
      const geometryOrGroup = typeof pendingObject.geometry === 'function' 
        ? pendingObject.geometry() 
        : pendingObject.geometry;
      let object: THREE.Object3D;
      
      if (geometryOrGroup instanceof THREE.Group) {
        object = geometryOrGroup;
      } else {
        const material = new THREE.MeshStandardMaterial({ 
          color: pendingObject.color || '#44aa88' 
        });
        object = new THREE.Mesh(geometryOrGroup, material);
      }
      
      object.position.copy(position);
      if (rotation) {
        object.rotation.copy(rotation);
      }
      
      const id = Math.random().toString(36).substr(2, 9);
      set((state) => ({
        objects: [...state.objects, {
          id,
          object,
          name: pendingObject.name,
          visible: true,
          locked: false
        }],
        placementMode: false,
        pendingObject: null
      }));
    }
  },
  
  cancelObjectPlacement: () => {
    set({
      placementMode: false,
      pendingObject: null
    });
  },
  
  // Actions
  undo: () => {
    // Implement undo logic
    console.log('Undo action');
  },
  
  redo: () => {
    // Implement redo logic
    console.log('Redo action');
  },
  
  duplicateObject: () => {
    const { selectedObject, objects } = get();
    if (selectedObject instanceof THREE.Mesh) {
      const original = objects.find(obj => obj.object === selectedObject);
      if (original) {
        const clonedGeometry = selectedObject.geometry.clone();
        const clonedMaterial = (selectedObject.material as THREE.Material).clone();
        const clonedMesh = new THREE.Mesh(clonedGeometry, clonedMaterial);
        
        clonedMesh.position.copy(selectedObject.position);
        clonedMesh.position.x += 1;
        clonedMesh.rotation.copy(selectedObject.rotation);
        clonedMesh.scale.copy(selectedObject.scale);
        
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          objects: [...state.objects, {
            id,
            object: clonedMesh,
            name: `${original.name} Copy`,
            visible: true,
            locked: false
          }]
        }));
      }
    }
  },
  
  mirrorObject: () => {
    const { selectedObject } = get();
    if (selectedObject) {
      selectedObject.scale.x *= -1;
      get().updateObjectProperties();
    }
  },
  
  zoomIn: () => {
    set((state) => ({
      cameraZoom: Math.min(state.cameraZoom * 1.2, 10)
    }));
  },
  
  zoomOut: () => {
    set((state) => ({
      cameraZoom: Math.max(state.cameraZoom / 1.2, 0.1)
    }));
  },
  
  // Application mode
  setApplicationMode: (mode) => {
    set({ applicationMode: mode });
  },
  
  // Presentation
  addSlide: (name) => {
    const { currentCameraState } = get();
    const id = Math.random().toString(36).substr(2, 9);
    
    const slide: Slide = {
      id,
      name,
      duration: 5,
      cameraPosition: currentCameraState.position,
      cameraTarget: currentCameraState.target,
      annotations: [],
      terrainType: 'none'
    };
    
    set((state) => ({
      slides: [...state.slides, slide],
      currentSlideIndex: state.slides.length,
      isCameraLocked: true
    }));
  },
  
  removeSlide: (id) => {
    set((state) => {
      const newSlides = state.slides.filter(slide => slide.id !== id);
      const newCurrentIndex = state.currentSlideIndex >= newSlides.length 
        ? Math.max(0, newSlides.length - 1) 
        : state.currentSlideIndex;
      
      return {
        slides: newSlides,
        currentSlideIndex: newCurrentIndex
      };
    });
  },

  // Helper function to extract geometry params from any object
  extractGeometryParams: (geometry: THREE.BufferGeometry) => {
    // Check for custom shape type first
    if (geometry.userData?.shapeType) {
      return {
        type: 'custom',
        shapeType: geometry.userData.shapeType,
        parameters: geometry.userData.parameters || {},
        boundingBox: (() => {
          const bbox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
          return {
            min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
            max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z }
          };
        })()
      };
    }

    if (geometry instanceof THREE.BoxGeometry) {
      return {
        type: 'box',
        width: geometry.parameters.width ?? 1,
        height: geometry.parameters.height ?? 1,
        depth: geometry.parameters.depth ?? 1
      };
    } else if (geometry instanceof THREE.SphereGeometry) {
      return {
        type: 'sphere',
        radius: geometry.parameters.radius ?? 0.5,
        widthSegments: geometry.parameters.widthSegments ?? 32,
        heightSegments: geometry.parameters.heightSegments ?? 16
      };
    } else if (geometry instanceof THREE.CylinderGeometry) {
      return {
        type: 'cylinder',
        radiusTop: geometry.parameters.radiusTop ?? 0.5,
        radiusBottom: geometry.parameters.radiusBottom ?? 0.5,
        height: geometry.parameters.height ?? 1,
        radialSegments: geometry.parameters.radialSegments ?? 32
      };
    } else if (geometry instanceof THREE.ConeGeometry) {
      return {
        type: 'cone',
        radius: geometry.parameters.radius ?? 0.5,
        height: geometry.parameters.
height ?? 1,
        radialSegments: geometry.parameters.radialSegments ?? 32
      };
    } else if (geometry instanceof THREE.PlaneGeometry) {
      return {
        type: 'plane',
        width: geometry.parameters.width ?? 1,
        height: geometry.parameters.height ?? 1,
        widthSegments: geometry.parameters.widthSegments ?? 1,
        heightSegments: geometry.parameters.heightSegments ?? 1
      };
    } else if (geometry instanceof THREE.PlaneGeometry) {
      return {
        type: 'plane',
        width: geometry.parameters.width,
        height: geometry.parameters.height,
        widthSegments: geometry.parameters.widthSegments,
        heightSegments: geometry.parameters.heightSegments
      };
    } else if (geometry instanceof THREE.TorusGeometry) {
      return {
        type: 'torus',
        radius: geometry.parameters.radius ?? 1,
        tube: geometry.parameters.tube ?? 0.4,
        radialSegments: geometry.parameters.radialSegments ?? 16,
        tubularSegments: geometry.parameters.tubularSegments ?? 100,
        arc: geometry.parameters.arc ?? Math.PI * 2
      };
    }
    
    // For custom or unknown geometries, store basic info
    const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    if (geometry.userData?.isImportedModel) {
      return {
        type: 'imported',
        modelPath: geometry.userData.modelPath,
        originalName: geometry.userData.originalName,
        originalScale: geometry.userData.originalScale || { x: 1, y: 1, z: 1 }
      };
    }
    
    // Check for custom shape types (heart, star, etc.)
    if (geometry.userData?.shapeType) {
      return {
        type: 'custom',
        shapeType: geometry.userData.shapeType,
        parameters: geometry.userData.parameters || {},
        vertexCount: geometry.attributes.position.count,
        boundingBox: {
          min: { x: boundingBox.min.x, y: boundingBox.min.y, z: boundingBox.min.z },
          max: { x: boundingBox.max.x, y: boundingBox.max.y, z: boundingBox.max.z }
        }
      };
    }
    
    return {
      type: 'custom',
      shapeType: 'unknown',
      vertexCount: geometry.attributes.position.count,
      boundingBox: {
        min: { x: boundingBox.min.x, y: boundingBox.min.y, z: boundingBox.min.z },
        max: { x: boundingBox.max.x, y: boundingBox.max.y, z: boundingBox.max.z }
      },
      hasNormals: !!geometry.attributes.normal,
      hasUVs: !!geometry.attributes.uv
    };
  },

  // Helper function to extract geometry params from any object
  extractObjectGeometryParams: (object: THREE.Object3D) => {
    // Check if the object itself has imported model userData
    if (object.userData?.isImportedModel) {
      return {
        type: 'imported',
        modelPath: object.userData.modelPath,
        originalName: object.userData.originalName,
        originalScale: object.userData.originalScale || { x: 1, y: 1, z: 1 }
      };
    }
    
    // If it's a mesh, extract geometry params
    if (object instanceof THREE.Mesh) {
      return get().extractGeometryParams(object.geometry);
    }
    
    // If it's a group, check if any child has imported model data
    if (object instanceof THREE.Group) {
      for (const child of object.children) {
        if (child.userData?.isImportedModel) {
          return {
            type: 'imported',
            modelPath: child.userData.modelPath,
            originalName: child.userData.originalName,
            originalScale: child.userData.originalScale || { x: 1, y: 1, z: 1 }
          };
        }
      }
      
      // If it's a group but not imported, check if it has custom shape data
      if (object.userData?.shapeType) {
        return {
          type: 'custom',
          shapeType: object.userData.shapeType,
          parameters: object.userData.parameters || {}
        };
      }
    }
    
    // Default fallback
    return { type: 'unknown' };
  },
  
  updateSlide: (id, updates) => {
    set((state) => ({
      slides: state.slides.map(slide => 
        slide.id === id ? { ...slide, ...updates } : slide
      )
    }));
  },
  
  goToSlide: (index) => {
    const { slides } = get();
    if (index >= 0 && index < slides.length) {
      set({ 
        currentSlideIndex: index,
        isCameraLocked: true
      });
    }
  },
  
  nextSlide: () => {
    const { slides, currentSlideIndex } = get();
    if (currentSlideIndex < slides.length - 1) {
      set({ 
        currentSlideIndex: currentSlideIndex + 1,
        isCameraLocked: true
      });
    }
  },
  
  previousSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ 
        currentSlideIndex: currentSlideIndex - 1,
        isCameraLocked: true
      });
    }
  },
  
  playPresentation: () => {
    set({ 
      isPlaying: true,
      isCameraLocked: true
    });
  },
  
  pausePresentation: () => {
    set({ isPlaying: false });
  },
  
  stopPresentation: () => {
    set({ 
      isPlaying: false,
      isCameraLocked: false
    });
  },
  
  updatePresentationSettings: (settings) => {
    set((state) => ({
      presentationSettings: { ...state.presentationSettings, ...settings }
    }));
  },
  
  captureCurrentView: (slideId) => {
    const { currentCameraState } = get();
    get().updateSlide(slideId, {
      cameraPosition: currentCameraState.position,
      cameraTarget: currentCameraState.target
    });
  },
  
  addAnnotation: (slideId, text, position) => {
    const annotationId = Math.random().toString(36).substr(2, 9);
    const annotation = {
      id: annotationId,
      text,
      position,
      type: 'point' as const
    };
    
    set((state) => ({
      slides: state.slides.map(slide => 
        slide.id === slideId 
          ? { ...slide, annotations: [...slide.annotations, annotation] }
          : slide
      )
    }));
  },
  
  addTextAnnotation: (slideId, text, position) => {
    const annotationId = Math.random().toString(36).substr(2, 9);
    const annotation = {
      id: annotationId,
      text,
      position,
      type: 'text' as const,
      fontSize: 24,
      color: '#ffffff'
    };
    
    set((state) => ({
      slides: state.slides.map(slide => 
        slide.id === slideId 
          ? { ...slide, annotations: [...slide.annotations, annotation] }
          : slide
      )
    }));
  },
  
  removeAnnotation: (slideId, annotationId) => {
    set((state) => ({
      slides: state.slides.map(slide => 
        slide.id === slideId 
          ? { ...slide, annotations: slide.annotations.filter(ann => ann.id !== annotationId) }
          : slide
      )
    }));
  },
  
  updateTextAnnotation: (slideId, annotationId, updates) => {
    set((state) => ({
      slides: state.slides.map(slide => 
        slide.id === slideId 
          ? { 
              ...slide, 
              annotations: slide.annotations.map(ann => 
                ann.id === annotationId ? { ...ann, ...updates } : ann
              )
            }
          : slide
      )
    }));
  },
  
  updateSlideBackground: (slideId, terrainType) => {
    get().updateSlide(slideId, { terrainType });
  },
  
  // Settings
  updateSceneSettings: (settings) => {
    set((state) => ({
      sceneSettings: { ...state.sceneSettings, ...settings }
    }));
  },
  
  // Student/Project management
  loadProjectData: async (projectData) => {
    // Clear existing scene
    get().clearScene();
    
    // Load objects, lights, groups, and settings from project data
    // This would involve recreating THREE.js objects from the saved data
    console.log('Loading project data:', projectData);
    
    // Update scene settings
    if (projectData.settings) {
      set((state) => ({
        sceneSettings: { ...state.sceneSettings, ...projectData.settings }
      }));
    }
  },
  
  clearScene: () => {
    set({
      objects: [],
      groups: [],
      lights: [],
      selectedObject: null,
      selectedLight: null,
      transformMode: null,
      editMode: null,
      placementMode: false,
      pendingObject: null
    });
  },
  
  resetToInitialState: () => {
    // Reset to completely fresh state
    set({
      ...initialState,
      // Recreate the cameraTarget as a new Vector3 instance
      cameraTarget: new THREE.Vector3(0, 0, 0)
    });
  },
  
  // Helper function to recreate custom shapes
  recreateCustomShape: (shapeType: string, parameters: any = {}) => {
    switch (shapeType) {
      case 'heart':
        return get().createHeartGeometry(parameters.size || 1);
      case 'star':
        return get().createStarGeometry(parameters.points || 5, parameters.innerRadius || 0.5, parameters.outerRadius || 1);
      default:
        console.warn('Unknown custom shape type:', shapeType);
        return new THREE.BoxGeometry(1, 1, 1);
    }
  },
  
  // Heart geometry creation
  createHeartGeometry: (size: number = 1) => {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
    heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.7, x, y + 10);
    heartShape.bezierCurveTo(x + 4, y + 7.7, x + 6, y + 5.5, x + 6, y + 3.5);
    heartShape.bezierCurveTo(x + 6, y + 3.5, x + 6, y, x, y);
    heartShape.bezierCurveTo(x + 4, y, x + 5, y + 5, x + 5, y + 5);
    
    const extrudeSettings = {
      depth: 0.5 * size,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1 * size,
      bevelThickness: 0.1 * size
    };
    
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.scale(size * 0.1, size * 0.1, size * 0.1);
    geometry.userData = { shapeType: 'heart', parameters: { size } };
    
    return geometry;
  },
  
  // Star geometry creation
  createStarGeometry: (points: number = 5, innerRadius: number = 0.5, outerRadius: number = 1) => {
    const starShape = new THREE.Shape();
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();
    
    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };
    
    const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    geometry.userData = { shapeType: 'star', parameters: { points, innerRadius, outerRadius } };
    
    return geometry;
  },
  
  loadProjectFromData: async (project) => {
    // Reset to initial state first to ensure clean slate
    get().resetToInitialState();
    
    if (!project.sceneData) return;
    
    const { sceneData } = project;
    
    // Load scene settings
    if (sceneData.settings) {
      set((state) => ({
        sceneSettings: { ...state.sceneSettings, ...sceneData.settings }
      }));
    }
    
    // Load presentation settings
    if (sceneData.presentationSettings) {
      set((state) => ({
        presentationSettings: { ...state.presentationSettings, ...sceneData.presentationSettings }
      }));
    }
    
    // Load slides
    if (sceneData.slides) {
      set({ slides: sceneData.slides });
    }
    
    // Separate imported and regular objects
    const importedObjects = sceneData.objects?.filter((obj: any) => 
      obj.geometryParams?.type === 'imported'
    ) || [];
    const regularObjects = sceneData.objects?.filter((obj: any) => 
      obj.geometryParams?.type !== 'imported'
    ) || [];
    
    // Helper functions for custom shapes
    const createHeartGeometry = (size: number = 1) => {
      const heartShape = new THREE.Shape();
      const x = 0, y = 0;
      heartShape.moveTo(x + 5, y + 5);
      heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
      heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
      heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.7, x, y + 10);
      heartShape.bezierCurveTo(x + 4, y + 7.7, x + 6, y + 5.5, x + 6, y + 3.5);
      heartShape.bezierCurveTo(x + 6, y + 3.5, x + 6, y, x, y);
      
      const extrudeSettings = {
        depth: 0.5 * size,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1 * size,
        bevelThickness: 0.1 * size
      };
      
      const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      geometry.scale(size * 0.1, size * 0.1, size * 0.1);
      geometry.userData = { shapeType: 'heart', parameters: { size } };
      return geometry;
    };

    const createStarGeometry = (outerRadius: number = 1, innerRadius: number = 0.5, points: number = 5) => {
      const starShape = new THREE.Shape();
      const angle = Math.PI / points;
      
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(i * angle) * radius;
        const y = Math.sin(i * angle) * radius;
        
        if (i === 0) {
          starShape.moveTo(x, y);
        } else {
          starShape.lineTo(x, y);
        }
      }
      starShape.closePath();
      
      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.05,
        bevelThickness: 0.05
      };
      
      const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      geometry.userData = { shapeType: 'star', parameters: { outerRadius, innerRadius, points } };
      return geometry;
    };

    // Process regular objects synchronously
    const recreatedRegularObjects: SceneObject[] = [];
    
    regularObjects.forEach((objData: any) => {
      try {
        let geometry: THREE.BufferGeometry;
        
        // Recreate geometry based on saved parameters
        if (objData.geometryParams) {
          console.log('Recreating geometry:', objData.name, objData.geometryParams);
          
          switch (objData.geometryParams.type) {
            case 'box':
              geometry = new THREE.BoxGeometry(
                objData.geometryParams.width ?? 1,
                objData.geometryParams.height ?? 1,
                objData.geometryParams.depth ?? 1
              );
              break;
            case 'sphere':
              geometry = new THREE.SphereGeometry(
                objData.geometryParams.radius ?? 0.5,
                objData.geometryParams.widthSegments ?? 32,
                objData.geometryParams.heightSegments ?? 16
              );
              break;
            case 'cylinder':
              geometry = new THREE.CylinderGeometry(
                objData.geometryParams.radiusTop ?? 0.5,
                objData.geometryParams.radiusBottom ?? 0.5,
                objData.geometryParams.height ?? 1,
                objData.geometryParams.radialSegments ?? 32
              );
              break;
            case 'cone':
              geometry = new THREE.ConeGeometry(
                objData.geometryParams.radius || objData.geometryParams.radiusBottom || 0.5,
                objData.geometryParams.height || 1,
                objData.geometryParams.radialSegments || 8,
                objData.geometryParams.heightSegments || 1,
                objData.geometryParams.openEnded || false,
                objData.geometryParams.thetaStart || 0,
                objData.geometryParams.thetaLength || Math.PI * 2
              );
              console.log('Recreated cone with params:', objData.geometryParams);
              break;
            case 'plane':
              geometry = new THREE.PlaneGeometry(
                objData.geometryParams.width ?? 1,
                objData.geometryParams.height ?? 1,
                objData.geometryParams.widthSegments ?? 1,
                objData.geometryParams.heightSegments ?? 1
              );
              break;
            case 'plane':
              geometry = new THREE.PlaneGeometry(
                objData.geometryParams.width || 1,
                objData.geometryParams.height || 1,
                objData.geometryParams.widthSegments || 1,
                objData.geometryParams.heightSegments || 1
              );
              break;
            case 'plane':
              geometry = new THREE.PlaneGeometry(
                objData.geometryParams.width || 1,
                objData.geometryParams.height || 1,
                objData.geometryParams.widthSegments || 1,
                objData.geometryParams.heightSegments || 1
              );
              break;
            case 'torus':
              geometry = new THREE.TorusGeometry(
                objData.geometryParams.radius ?? 1,
                objData.geometryParams.tube ?? 0.4,
                objData.geometryParams.radialSegments ?? 16,
                objData.geometryParams.tubularSegments ?? 100,
                objData.geometryParams.arc ?? Math.PI * 2
              );
              break;
            case 'custom':
              // Handle custom shapes like heart, star, etc.
              if (objData.geometryParams.shapeType) {
                geometry = get().recreateCustomShape(objData.geometryParams.shapeType, objData.geometryParams.parameters);
              } else if (objData.geometryParams.boundingBox) {
                // For other custom geometries, create a placeholder that represents the original shape
                const size = objData.geometryParams.parameters?.size ?? 1;
                geometry = createHeartGeometry(size);
              } else if (objData.geometryParams.shapeType === 'star') {
                const outerRadius = objData.geometryParams.parameters?.outerRadius ?? 1;
                const innerRadius = objData.geometryParams.parameters?.innerRadius ?? 0.5;
                const points = objData.geometryParams.parameters?.points ?? 5;
                geometry = createStarGeometry(outerRadius, innerRadius, points);
              } else if (objData.geometryParams.boundingBox) {
                // For other custom geometries, create a placeholder that represents the original shape
                geometry = get().recreateCustomShape(objData.geometryParams.shapeType, objData.geometryParams.parameters);
              } else if (objData.geometryParams.boundingBox) {
                // For other custom geometries, create a placeholder that represents the original shape
                const bbox = objData.geometryParams.boundingBox;
                const width = bbox.max.x - bbox.min.x;
                const height = bbox.max.y - bbox.min.y;
                const depth = bbox.max.z - bbox.min.z;
                geometry = new THREE.BoxGeometry(width, height, depth);
                
                // Mark as generic custom shape placeholder
                geometry.userData = {
                  isCustomShape: true,
                  shapeType: 'unknown',
                  originalVertexCount: objData.geometryParams.vertexCount,
                  originalBoundingBox: objData.geometryParams.boundingBox
                };
              } else {
                geometry = new THREE.BoxGeometry(1, 1, 1);
                geometry.userData = {
                  isCustomShape: true
                };
              }
              break;
            default:
              // Unknown type - create a fallback box geometry
              console.warn('Unknown geometry type:', objData.geometryParams.type);
              geometry = new THREE.BoxGeometry(1, 1, 1);
              console.warn('Unknown geometry type:', objData.geometryParams.type, 'for object:', objData.name);
              break;
          }
        } else {
          console.warn('No geometry parameters found for object:', objData.name);
          console.warn('No geometry parameters found for object:', objData.name, 'using default box');
          // No geometry params - create default box
          console.warn('No geometry params found for object:', objData.name);
          geometry = new THREE.BoxGeometry(1, 1, 1);
          geometry.userData = {
            isMissingGeometryParams: true
          };
        }

        // If we have saved raw geometry data (positions/index), reconstruct geometry to include vertex/edge edits
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
            console.warn('Failed to rebuild geometry from saved data for:', objData.name, e);
          }
        }
        
        // Ensure geometry is always defined
        if (!geometry) {
          console.error('Geometry is undefined for object:', objData.name, 'creating fallback');
          geometry = new THREE.BoxGeometry(1, 1, 1);
          geometry.userData = {
            isFallbackGeometry: true
          };
        }
        
        // Ensure geometry is valid
        if (!geometry) {
          console.error('Failed to create geometry for object:', objData.name);
          console.warn('No geometry parameters found for object:', objData.name, 'using default box');
          geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        if (objData.geometryParams) {
          geometry.userData = {
            ...(geometry.userData || {}),
            geometryParams: objData.geometryParams
          };
        }

        // Recreate material with proper color
        const material = new THREE.MeshStandardMaterial({
          color: objData.color || '#44aa88'
        });
        
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

        // Restore wireframe (edges) appearance if present in saved data
        try {
          if (objData.wireframe) {
            const wfMat = new THREE.LineBasicMaterial({
              color: objData.wireframe.color || '#ffffff',
              transparent: true,
              opacity: typeof objData.wireframe.opacity === 'number' ? objData.wireframe.opacity : 1
            });
            const edgesGeom = new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry);
            const wfObj = new THREE.LineSegments(edgesGeom, wfMat);
            wfObj.visible = !!objData.wireframe.visible;
            (mesh as any).userData.wireframeObject = wfObj;
            (mesh as any).userData.wireframeMaterial = wfMat;
            (mesh as any).userData.wireframeLinewidth = objData.wireframe.linewidth ?? 1;
            mesh.add(wfObj);
          }
        } catch {}
        
        recreatedRegularObjects.push({
          id: objData.id,
          object: mesh,
          name: objData.name,
          visible: objData.visible !== false,
          locked: objData.locked || false,
          groupId: objData.groupId
        });
      } catch (error) {
        console.error('Failed to recreate object:', objData.name, error);
        
        // Create error placeholder
        try {
          const errorGeometry = new THREE.BoxGeometry(1, 1, 1);
          const errorMaterial = new THREE.MeshStandardMaterial({ 
            color: '#ff6b6b',
            transparent: true,
            opacity: 0.7
          });
          const errorMesh = new THREE.Mesh(errorGeometry, errorMaterial);
          
          // Apply basic transforms if available
          if (objData.position) {
            errorMesh.position.set(objData.position.x, objData.position.y, objData.position.z);
          }
          
          recreatedRegularObjects.push({
            id: objData.id,
            object: errorMesh,
            name: `${objData.name} (Error)`,
            visible: objData.visible !== false,
            locked: objData.locked || false,
            groupId: objData.groupId
          });
        } catch (fallbackError) {
          console.error('Failed to create error placeholder for:', objData.name, fallbackError);
        }
        
        // Create an error placeholder so the object still appears in the scene
        const errorGeometry = new THREE.BoxGeometry(1, 1, 1);
        const errorMaterial = new THREE.MeshStandardMaterial({ 
          color: '#ff0000',
          transparent: true,
          opacity: 0.7
        });
        const errorMesh = new THREE.Mesh(errorGeometry, errorMaterial);
        
        // Apply basic transforms if available
        if (objData.position) {
          errorMesh.position.set(objData.position.x, objData.position.y, objData.position.z);
        }
        
        errorMesh.userData = {
          isErrorPlaceholder: true,
          originalData: objData
        };
        
        recreatedRegularObjects.push({
          id: objData.id,
          object: errorMesh,
          name: `${objData.name} (Error)`,
          visible: objData.visible !== false,
          locked: objData.locked || false,
          groupId: objData.groupId
        });
      }
    });
    
    // Process imported models asynchronously and wait for all to complete
    const importedObjectPromises = importedObjects.map(async (objData: any): Promise<SceneObject> => {
      try {
        // Load the actual GLB model
        const { loadGLBModel } = await import('../utils/modelLoader');
        const loadedModel = await loadGLBModel(objData.geometryParams.modelPath);
        
        // Use the loaded model directly as the object
        let finalObject: THREE.Object3D;
        
        if (loadedModel instanceof THREE.Group) {
          finalObject = loadedModel.clone();
        } else if (loadedModel instanceof THREE.Mesh) {
          finalObject = loadedModel.clone();
        } else {
          // Fallback to the loaded model as-is
          finalObject = loadedModel;
        }
        
        // Apply transforms
        if (objData.position) {
          finalObject.position.set(objData.position.x, objData.position.y, objData.position.z);
        }
        if (objData.rotation) {
          finalObject.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);
        }
        if (objData.scale) {
          finalObject.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
        }
        
        finalObject.visible = objData.visible !== false;
        
        // Mark the object as imported for future reference
        finalObject.userData = {
          isImportedModel: true,
          modelPath: objData.geometryParams.modelPath,
          originalName: objData.geometryParams.originalName
        };
        
        // Return the scene object
        return {
          id: objData.id,
          object: finalObject,
          name: objData.name,
          visible: objData.visible !== false,
          locked: objData.locked || false,
          groupId: objData.groupId
        };
        
      } catch (error) {
        console.warn('Failed to load imported model:', objData.geometryParams.modelPath, error);
        
        // Create a placeholder cube with a clear indication it's a failed import
        const placeholderGeometry = new THREE.BoxGeometry(1, 1, 1);
        const placeholderMaterial = new THREE.MeshStandardMaterial({ 
          color: '#ff6b6b',
          transparent: true,
          opacity: 0.7
        });
        const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
        
        // Apply transforms
        if (objData.position) {
          placeholder.position.set(objData.position.x, objData.position.y, objData.position.z);
        }
        if (objData.rotation) {
          placeholder.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);
        }
        if (objData.scale) {
          placeholder.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
        }
        
        placeholder.visible = objData.visible !== false;
        
        // Mark as failed import
        placeholder.userData = {
          isFailedImport: true,
          originalModelPath: objData.geometryParams.modelPath,
          originalName: objData.geometryParams.originalName
        };
        
        // Return the placeholder scene object
        return {
          id: objData.id,
          object: placeholder,
          name: `${objData.name} (Import Failed)`,
          visible: objData.visible !== false,
          locked: objData.locked || false,
          groupId: objData.groupId
        };
      }
    });
    
    // Wait for all imported models to load
    let recreatedImportedObjects: SceneObject[] = [];
    if (importedObjectPromises.length > 0) {
      try {
        recreatedImportedObjects = await Promise.all(importedObjectPromises);
      } catch (error) {
        console.error('Error loading some imported models:', error);
        // Promise.all will still resolve with the results that succeeded
        // and placeholders for those that failed
      }
    }
    
    // Combine all objects (regular + imported)
    const allRecreatedObjects = [...recreatedRegularObjects, ...recreatedImportedObjects];
    
    // Load groups
    const recreatedGroups: Group[] = sceneData.groups || [];
    
    // Recreate lights
    const recreatedLights: Light[] = [];
    
    if (sceneData.lights) {
      sceneData.lights.forEach((lightData: any) => {
        try {
          let light: THREE.Light;
          
          switch (lightData.type) {
            case 'directional':
              light = new THREE.DirectionalLight(lightData.color, lightData.intensity);
              light.position.set(...lightData.position);
              if (lightData.target) {
                light.target.position.set(...lightData.target);
              }
              break;
            case 'point':
              light = new THREE.PointLight(
                lightData.color, 
                lightData.intensity, 
                lightData.distance, 
                lightData.decay
              );
              light.position.set(...lightData.position);
              break;
            case 'spot':
              light = new THREE.SpotLight(
                lightData.color,
                lightData.intensity,
                lightData.distance,
                lightData.angle,
                lightData.penumbra,
                lightData.decay
              );
              light.position.set(...lightData.position);
              if (lightData.target) {
                light.target.position.set(...lightData.target);
              }
              break;
            default:
              return;
          }
          
          light.visible = lightData.visible !== false;
          light.castShadow = lightData.castShadow || false;
          
          recreatedLights.push({
            ...lightData,
            object: light
          });
        } catch (error) {
          console.warn('Failed to recreate light:', lightData.name, error);
        }
      });
    }
    
    // Update state with all recreated objects at once
    set({
      objects: allRecreatedObjects,
      groups: recreatedGroups,
      lights: recreatedLights
    });
  }
}));