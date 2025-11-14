import * as THREE from 'three';

export const extractGeometryParams = (geometry: THREE.BufferGeometry) => {
  // Check if this is an imported model by looking at userData
  if (geometry.userData && geometry.userData.isImportedModel) {
    return {
      type: 'imported',
      modelPath: geometry.userData.modelPath,
      originalName: geometry.userData.originalName,
      scale: geometry.userData.originalScale || { x: 1, y: 1, z: 1 },
      boundingBox: geometry.userData.boundingBox || null
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
      radialSegments: geometry.parameters.radialSegments ?? 32,
      heightSegments: geometry.parameters.heightSegments ?? 1,
      openEnded: geometry.parameters.openEnded ?? false,
      thetaStart: geometry.parameters.thetaStart ?? 0,
      thetaLength: geometry.parameters.thetaLength ?? Math.PI * 2
    };
  } else if (geometry instanceof THREE.ConeGeometry) {
    return {
      type: 'cone',
      radius: geometry.parameters.radius,
      height: geometry.parameters.height,
      radialSegments: geometry.parameters.radialSegments,
      heightSegments: geometry.parameters.heightSegments ?? 1,
      openEnded: geometry.parameters.openEnded ?? false,
      thetaStart: geometry.parameters.thetaStart ?? 0,
      thetaLength: geometry.parameters.thetaLength ?? Math.PI * 2
    };
  } else if (geometry instanceof THREE.TorusGeometry) {
    return {
      type: 'torus',
      radiusTop: 0, // Explicitly set for proper cone identification
      radiusBottom: geometry.parameters.radius,
      tube: geometry.parameters.tube,
      radialSegments: geometry.parameters.radialSegments,
      tubularSegments: geometry.parameters.tubularSegments,
      arc: geometry.parameters.arc
    };
  } else {
    // For custom or complex geometries, try to preserve basic shape info
    const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    return {
      type: 'custom',
      vertexCount: geometry.attributes.position.count,
      boundingBox: {
        min: { x: boundingBox.min.x, y: boundingBox.min.y, z: boundingBox.min.z },
        max: { x: boundingBox.max.x, y: boundingBox.max.y, z: boundingBox.max.z }
      },
      hasNormals: !!geometry.attributes.normal,
      hasUVs: !!geometry.attributes.uv
    };
  }
};

// Helper function to extract geometry params from any object
export const extractObjectGeometryParams = (object: THREE.Object3D) => {
  // Check if the object itself has imported model userData
  if (object.userData?.isImportedModel) {
    return {
      type: 'imported',
      modelPath: object.userData.modelPath,
      originalName: object.userData.originalName
    };
  }
  
  // If it's a mesh, extract geometry params
  if (object instanceof THREE.Mesh) {
    return extractGeometryParams(object.geometry);
  }
  
  // If it's a group, check if any child has imported model data
  if (object instanceof THREE.Group) {
    for (const child of object.children) {
      if (child.userData?.isImportedModel) {
        return {
          type: 'imported',
          modelPath: child.userData.modelPath,
          originalName: child.userData.originalName
        };
      }
    }
  }
  
  // Default fallback
  return { type: 'unknown' };
};