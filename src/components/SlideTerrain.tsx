import React, { useMemo } from 'react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

// Helper function to create a simple tree geometry
const createTreeGeometry = (height: number, trunkRadius: number, crownRadius: number) => {
  const group = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, height * 0.4, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = height * 0.2;
  group.add(trunk);
  
  // Crown (foliage)
  const crownGeometry = new THREE.SphereGeometry(crownRadius, 8, 6);
  const crownMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = height * 0.4 + crownRadius * 0.7;
  group.add(crown);
  
  return group;
};

// Helper function to create a rock geometry
const createRockGeometry = (size: number) => {
  const geometry = new THREE.DodecahedronGeometry(size, 0);
  const material = new THREE.MeshStandardMaterial({ 
    color: '#696969',
    roughness: 0.9,
    metalness: 0.1
  });
  return new THREE.Mesh(geometry, material);
};

// Helper function to create grass patches
const createGrassGeometry = (size: number) => {
  const geometry = new THREE.ConeGeometry(size, size * 2, 3);
  const material = new THREE.MeshStandardMaterial({ 
    color: '#32CD32',
    transparent: true,
    opacity: 0.8
  });
  return new THREE.Mesh(geometry, material);
};

// Helper function to create a cactus
const createCactusGeometry = (height: number) => {
  const group = new THREE.Group();
  
  // Main body
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, height, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = height / 2;
  group.add(body);
  
  // Arms
  if (height > 2) {
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.25, height * 0.6, 6);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.5, height * 0.6, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.5, height * 0.4, 0);
    rightArm.rotation.z = -Math.PI / 8;
    group.add(rightArm);
  }
  
  return group;
};

const SlideTerrain: React.FC = () => {
  const { slides, currentSlideIndex, sceneSettings } = useSceneStore();
  
  const currentSlide = slides[currentSlideIndex];
  
  const terrainGeometry = useMemo(() => {
    if (!currentSlide || !currentSlide.terrainType || currentSlide.terrainType === 'none') {
      return null;
    }

    const size = sceneSettings.gridSize * 1.5; // Terrain size adapts to grid size
    const segments = 64; // Resolution for detail
    const centerRadius = sceneSettings.gridSize * 0.5; // Larger center exclusion zone
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Generate height map based on terrain type
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Calculate distance from center and edge
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const distanceFromEdge = Math.min(
        size/2 - Math.abs(x),
        size/2 - Math.abs(z)
      );
      
      // Create falloff factors - terrain increases towards edges
      const centerFalloff = Math.max(0, Math.min(1, (distanceFromCenter - centerRadius) / 6));
      const edgeIntensity = Math.max(0, 1 - (distanceFromEdge / (size * 0.25))); // More concentrated at edges
      
      let height = 0;
      
      switch (currentSlide.terrainType) {
        case 'mountains':
          // Mountain peaks concentrated at edges
          height = 
            Math.sin(x * 0.06) * Math.cos(z * 0.06) * 5 * edgeIntensity +
            Math.sin(x * 0.12) * Math.cos(z * 0.1) * 3 * edgeIntensity +
            Math.sin(x * 0.25) * Math.cos(z * 0.2) * 1.5 * edgeIntensity +
            Math.random() * 0.2;
          height = Math.max(0, height * 2);
          break;
          
        case 'rocky-desert':
          // Mesas positioned at edges
          const edgeOffset = size * 0.35;
          const mesa1 = Math.max(0, 4 - Math.sqrt((x - edgeOffset) * (x - edgeOffset) + (z - edgeOffset) * (z - edgeOffset)) * 0.12) * edgeIntensity;
          const mesa2 = Math.max(0, 3.5 - Math.sqrt((x + edgeOffset) * (x + edgeOffset) + (z + edgeOffset) * (z + edgeOffset)) * 0.15) * edgeIntensity;
          const mesa3 = Math.max(0, 3.8 - Math.sqrt((x - edgeOffset) * (x - edgeOffset) + (z + edgeOffset) * (z + edgeOffset)) * 0.13) * edgeIntensity;
          const mesa4 = Math.max(0, 3.2 - Math.sqrt((x + edgeOffset) * (x + edgeOffset) + (z - edgeOffset) * (z - edgeOffset)) * 0.16) * edgeIntensity;
          const rocky = Math.sin(x * 0.15) * Math.cos(z * 0.12) * 1.2 * edgeIntensity + Math.random() * 0.3;
          height = Math.max(0, mesa1 + mesa2 + mesa3 + mesa4 + rocky);
          break;
          
        case 'rolling-hills':
          // Hills concentrated towards edges
          height = 
            Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3 * edgeIntensity +
            Math.sin(x * 0.08) * Math.cos(z * 0.07) * 1.5 * edgeIntensity +
            Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.8 * edgeIntensity +
            Math.random() * 0.1;
          height = Math.max(0, height);
          break;
          
        case 'canyon':
          // Steep canyon walls at the very edges
          const wallHeight = Math.max(0, (distanceFromEdge < size * 0.12) ? 
            (size * 0.12 - distanceFromEdge) * 0.6 : 0);
          const canyonRoughness = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.6 * edgeIntensity;
          height = Math.max(0, wallHeight + canyonRoughness + Math.random() * 0.15);
          break;
      }
      
      // Apply center falloff to keep the center area mostly flat
      height *= Math.pow(centerFalloff, 2); // Stronger falloff for flatter center
      
      vertices[i + 2] = height; // Set Y coordinate (height)
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, [currentSlide?.terrainType, sceneSettings.gridSize]);

  // Generate environmental details
  const environmentalDetails = useMemo(() => {
    if (!currentSlide || !currentSlide.terrainType || currentSlide.terrainType === 'none') {
      return [];
    }

    const details: THREE.Object3D[] = [];
    const size = sceneSettings.gridSize * 1.5;
    const centerRadius = sceneSettings.gridSize * 0.5; // Larger exclusion zone
    const numDetails = Math.floor(sceneSettings.gridSize * 0.8); // Scale details with grid size

    // Helper function to calculate terrain height at a given position
    const getTerrainHeight = (x: number, z: number) => {
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const distanceFromEdge = Math.min(
        size/2 - Math.abs(x),
        size/2 - Math.abs(z)
      );
      
      const centerFalloff = Math.max(0, Math.min(1, (distanceFromCenter - centerRadius) / 6));
      const edgeIntensity = Math.max(0, 1 - (distanceFromEdge / (size * 0.25)));
      
      let height = 0;
      
      switch (currentSlide.terrainType) {
        case 'mountains':
          height = 
            Math.sin(x * 0.06) * Math.cos(z * 0.06) * 5 * edgeIntensity +
            Math.sin(x * 0.12) * Math.cos(z * 0.1) * 3 * edgeIntensity +
            Math.sin(x * 0.25) * Math.cos(z * 0.2) * 1.5 * edgeIntensity +
            Math.random() * 0.2;
          height = Math.max(0, height * 2);
          break;
          
        case 'rocky-desert':
          const edgeOffset = size * 0.35;
          const mesa1 = Math.max(0, 4 - Math.sqrt((x - edgeOffset) * (x - edgeOffset) + (z - edgeOffset) * (z - edgeOffset)) * 0.12) * edgeIntensity;
          const mesa2 = Math.max(0, 3.5 - Math.sqrt((x + edgeOffset) * (x + edgeOffset) + (z + edgeOffset) * (z + edgeOffset)) * 0.15) * edgeIntensity;
          const mesa3 = Math.max(0, 3.8 - Math.sqrt((x - edgeOffset) * (x - edgeOffset) + (z + edgeOffset) * (z + edgeOffset)) * 0.13) * edgeIntensity;
          const mesa4 = Math.max(0, 3.2 - Math.sqrt((x + edgeOffset) * (x + edgeOffset) + (z - edgeOffset) * (z - edgeOffset)) * 0.16) * edgeIntensity;
          const rocky = Math.sin(x * 0.15) * Math.cos(z * 0.12) * 1.2 * edgeIntensity + Math.random() * 0.3;
          height = Math.max(0, mesa1 + mesa2 + mesa3 + mesa4 + rocky);
          break;
          
        case 'rolling-hills':
          height = 
            Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3 * edgeIntensity +
            Math.sin(x * 0.08) * Math.cos(z * 0.07) * 1.5 * edgeIntensity +
            Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.8 * edgeIntensity +
            Math.random() * 0.1;
          height = Math.max(0, height);
          break;
          
        case 'canyon':
          const wallHeight = Math.max(0, (distanceFromEdge < size * 0.12) ? 
            (size * 0.12 - distanceFromEdge) * 0.6 : 0);
          const canyonRoughness = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.6 * edgeIntensity;
          height = Math.max(0, wallHeight + canyonRoughness + Math.random() * 0.15);
          break;
      }
      
      return height * Math.pow(centerFalloff, 2);
    };
    for (let i = 0; i < numDetails; i++) {
      // Generate random position away from center
      let x, z, distanceFromCenter;
      let attempts = 0;
      
      do {
        x = (Math.random() - 0.5) * size * 0.8;
        z = (Math.random() - 0.5) * size * 0.8;
        distanceFromCenter = Math.sqrt(x * x + z * z);
        attempts++;
      } while (distanceFromCenter < centerRadius * 1.5 && attempts < 20);
      
      if (attempts >= 20) continue; // Skip if can't find good position

      // Calculate terrain height at this position
      const terrainHeight = getTerrainHeight(x, z);
      let detail: THREE.Object3D | null = null;
      
      switch (currentSlide.terrainType) {
        case 'mountains':
          if (Math.random() < 0.6) {
            // Pine trees
            detail = createTreeGeometry(2 + Math.random() * 2, 0.1, 0.8);
            detail.children.forEach(child => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                if (child.material.color.getHex() === 0x228B22) {
                  child.material.color.setHex(0x0F4F0F); // Darker green for pine
                }
              }
            });
          } else {
            // Rocks
            detail = createRockGeometry(0.3 + Math.random() * 0.4);
          }
          break;
          
        case 'rocky-desert':
          if (Math.random() < 0.4) {
            // Cacti
            detail = createCactusGeometry(1.5 + Math.random() * 2);
          } else {
            // Desert rocks
            detail = createRockGeometry(0.2 + Math.random() * 0.6);
            if (detail instanceof THREE.Mesh && detail.material instanceof THREE.MeshStandardMaterial) {
              detail.material.color.setHex(0xD2B48C); // Sandy color
            }
          }
          break;
          
        case 'rolling-hills':
          if (Math.random() < 0.7) {
            // Oak trees and grass
            if (Math.random() < 0.6) {
              detail = createTreeGeometry(3 + Math.random() * 2, 0.15, 1.2);
            } else {
              detail = createGrassGeometry(0.2 + Math.random() * 0.3);
            }
          } else {
            // Small rocks
            detail = createRockGeometry(0.2 + Math.random() * 0.3);
          }
          break;
          
        case 'canyon':
          if (Math.random() < 0.3) {
            // Sparse desert vegetation
            if (Math.random() < 0.7) {
              detail = createCactusGeometry(1 + Math.random() * 1.5);
            } else {
              detail = createRockGeometry(0.4 + Math.random() * 0.8);
              if (detail instanceof THREE.Mesh && detail.material instanceof THREE.MeshStandardMaterial) {
                detail.material.color.setHex(0xCD853F); // Canyon rock color
              }
            }
          }
          break;
      }
      
      if (detail) {
        detail.position.set(x, terrainHeight, z);
        detail.rotation.y = Math.random() * Math.PI * 2; // Random rotation
        
        // Add some random scale variation
        const scale = 0.8 + Math.random() * 0.4;
        detail.scale.setScalar(scale);
        
        details.push(detail);
      }
    }
    
    return details;
  }, [currentSlide?.terrainType, sceneSettings.gridSize]);
  const terrainMaterial = useMemo(() => {
    if (!currentSlide?.terrainType || currentSlide.terrainType === 'none') {
      return null;
    }

    let color: string;
    let roughness: number;
    let metalness: number;

    switch (currentSlide.terrainType) {
      case 'mountains':
        color = '#D3D3D3'; // Gray-white mountain color
        roughness = 0.9;
        metalness = 0.1;
        break;
      case 'rocky-desert':
        color = '#D2B48C'; // Sandy desert color
        roughness = 0.95;
        metalness = 0.05;
        break;
      case 'rolling-hills':
        color = '#9ACD32'; // Green hills color
        roughness = 0.8;
        metalness = 0.1;
        break;
      case 'canyon':
        color = '#CD853F'; // Canyon rock color
        roughness = 0.85;
        metalness = 0.15;
        break;
      default:
        color = '#8B7355';
        roughness = 0.9;
        metalness = 0.1;
    }

    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      side: THREE.DoubleSide
    });
  }, [currentSlide?.terrainType]);

  if (!currentSlide || !currentSlide.terrainType || currentSlide.terrainType === 'none' || !terrainGeometry || !terrainMaterial) {
    return null;
  }

  return (
    <group>
      {/* Terrain mesh */}
      <mesh 
        geometry={terrainGeometry} 
        material={terrainMaterial}
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to be horizontal
        position={[0, -0.1, 0]} // Slightly below the grid
      />
      
      {/* Environmental details */}
      {environmentalDetails.map((detail, index) => (
        <primitive key={index} object={detail} />
      ))}
    </group>
  );
};

export default SlideTerrain;