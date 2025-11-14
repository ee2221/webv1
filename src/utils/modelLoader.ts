import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';

interface LoadGLBOptions {
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  materialOverrides?: { [materialName: string]: string };
}

export const loadGLBModel = async (
  path: string, 
  options: LoadGLBOptions = {}
): Promise<THREE.Object3D> => {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        
        // Store original model information in userData
        model.userData = {
          isImportedModel: true,
          modelPath: path,
          originalName: path.split('/').pop()?.replace('.glb', '') || 'Imported Model'
        };
        
        // Also mark all children as part of imported model
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.userData = {
              isImportedModel: true,
              modelPath: path,
              originalName: path.split('/').pop()?.replace('.glb', '') || 'Imported Model'
            };
          }
        });
        
        // Apply scale if specified
        if (options.scale !== undefined) {
          model.scale.setScalar(options.scale);
        }
        
        // Apply position if specified
        if (options.position) {
          model.position.set(
            options.position.x,
            options.position.y,
            options.position.z
          );
        }
        
        // Apply rotation if specified
        if (options.rotation) {
          model.rotation.set(
            options.rotation.x,
            options.rotation.y,
            options.rotation.z
          );
        }
        
        // Apply material overrides if specified
        if (options.materialOverrides) {
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const materialName = child.material.name || 'default';
              const overrideColor = options.materialOverrides![materialName];
              
              if (overrideColor) {
                if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.color.setStyle(overrideColor);
                }
              }
            }
          });
        }
        
        resolve(model);
      },
      undefined,
      (error) => {
        console.error('Error loading GLB model:', error);
        reject(error);
      }
    );
  });
};