import React, { useState } from 'react';
import { Box, Circle, Triangle, Cylinder, Cone, Cherry as Sphere, Plus, Move, RotateCw, Scale, Edit, MousePointer, ChevronDown, Lightbulb, Sun, Zap, TreePine, Flower, Mountain, Heart, Star, Dot, Minus, Type, X, Shapes, Upload, FileText, Loader2, CheckCircle, AlertCircle, Waves, Bed, Dog, Utensils, Package, Library } from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';
import { loadGLBModel } from '../utils/modelLoader';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { STLLoader } from 'three-stdlib';

const Toolbar: React.FC = () => {
  const { 
    selectedObject, 
    transformMode, 
    editMode, 
    setTransformMode, 
    setEditMode,
    startObjectPlacement,
    addLight
  } = useSceneStore();
  
  const [showObjectLibrary, setShowObjectLibrary] = useState(false);
  const [showTransformObjects, setShowTransformObjects] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [textInput, setTextInput] = useState('Hello World');
  const [showTextInput, setShowTextInput] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Imported models list
  const importedModels = [
    // Models will be populated here when imported
  ];

  // Custom Circle Icon Component for Sphere
  const CircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );

  // Custom Donut Icon Component for Torus
  const DonutIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );

  // Complete alphabet function to create letter shapes
  const createLetterShape = (char: string) => {
    const shape = new THREE.Shape();
    const charWidth = 0.8;
    const charHeight = 1.2;
    
    // Handle both uppercase and lowercase
    const upperChar = char.toUpperCase();
    const isLowercase = char !== upperChar;
    
    // Adjust dimensions for lowercase letters
    const height = isLowercase ? charHeight * 0.7 : charHeight;
    const width = charWidth;
    
    switch (upperChar) {
      case 'A':
        if (isLowercase) {
          // Lowercase 'a' - circular with vertical line
          shape.moveTo(width * 0.3, 0);
          shape.bezierCurveTo(width * 0.1, 0, 0, height * 0.2, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.6, width * 0.1, height * 0.8, width * 0.3, height * 0.8);
          shape.lineTo(width * 0.7, height * 0.8);
          shape.lineTo(width * 0.7, 0);
          shape.lineTo(width * 0.5, 0);
          shape.lineTo(width * 0.5, height * 0.6);
          shape.lineTo(width * 0.3, height * 0.6);
          shape.bezierCurveTo(width * 0.2, height * 0.6, width * 0.15, height * 0.5, width * 0.15, height * 0.4);
          shape.bezierCurveTo(width * 0.15, height * 0.3, width * 0.2, height * 0.2, width * 0.3, height * 0.2);
          shape.lineTo(width * 0.5, height * 0.2);
          shape.lineTo(width * 0.5, 0);
          shape.lineTo(width * 0.3, 0);
        } else {
          // Uppercase 'A'
          shape.moveTo(width * 0.1, 0);
          shape.lineTo(width * 0.5, height);
          shape.lineTo(width * 0.9, 0);
          shape.lineTo(width * 0.75, 0);
          shape.lineTo(width * 0.65, height * 0.3);
          shape.lineTo(width * 0.35, height * 0.3);
          shape.lineTo(width * 0.25, 0);
          shape.lineTo(width * 0.1, 0);
          
          // Create hole for crossbar
          const hole = new THREE.Path();
          hole.moveTo(width * 0.42, height * 0.45);
          hole.lineTo(width * 0.58, height * 0.45);
          hole.lineTo(width * 0.55, height * 0.55);
          hole.lineTo(width * 0.45, height * 0.55);
          hole.lineTo(width * 0.42, height * 0.45);
          shape.holes.push(hole);
        }
        break;
        
      case 'B':
        if (isLowercase) {
          // Lowercase 'b'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 1.4); // Ascender
          shape.lineTo(width * 0.15, height * 1.4);
          shape.lineTo(width * 0.15, height * 0.8);
          shape.lineTo(width * 0.6, height * 0.8);
          shape.bezierCurveTo(width * 0.85, height * 0.8, width, height * 0.65, width, height * 0.4);
          shape.bezierCurveTo(width, height * 0.15, width * 0.85, 0, width * 0.6, 0);
          shape.lineTo(0, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.15);
          hole.lineTo(width * 0.6, height * 0.15);
          hole.bezierCurveTo(width * 0.75, height * 0.15, width * 0.85, height * 0.25, width * 0.85, height * 0.4);
          hole.bezierCurveTo(width * 0.85, height * 0.55, width * 0.75, height * 0.65, width * 0.6, height * 0.65);
          hole.lineTo(width * 0.15, height * 0.65);
          hole.lineTo(width * 0.15, height * 0.15);
          shape.holes.push(hole);
        } else {
          // Uppercase 'B'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.6, height);
          shape.bezierCurveTo(width * 0.8, height, width * 0.9, height * 0.85, width * 0.9, height * 0.75);
          shape.bezierCurveTo(width * 0.9, height * 0.65, width * 0.85, height * 0.55, width * 0.75, height * 0.5);
          shape.bezierCurveTo(width * 0.85, height * 0.45, width * 0.9, height * 0.35, width * 0.9, height * 0.25);
          shape.bezierCurveTo(width * 0.9, height * 0.15, width * 0.8, 0, width * 0.6, 0);
          shape.lineTo(0, 0);
          
          // Create holes for both bumps
          const hole1 = new THREE.Path();
          hole1.moveTo(width * 0.15, height * 0.55);
          hole1.lineTo(width * 0.6, height * 0.55);
          hole1.bezierCurveTo(width * 0.7, height * 0.55, width * 0.75, height * 0.65, width * 0.75, height * 0.75);
          hole1.bezierCurveTo(width * 0.75, height * 0.8, width * 0.7, height * 0.85, width * 0.6, height * 0.85);
          hole1.lineTo(width * 0.15, height * 0.85);
          hole1.lineTo(width * 0.15, height * 0.55);
          shape.holes.push(hole1);
          
          const hole2 = new THREE.Path();
          hole2.moveTo(width * 0.15, height * 0.15);
          hole2.lineTo(width * 0.6, height * 0.15);
          hole2.bezierCurveTo(width * 0.7, height * 0.15, width * 0.75, height * 0.2, width * 0.75, height * 0.25);
          hole2.bezierCurveTo(width * 0.75, height * 0.35, width * 0.7, height * 0.4, width * 0.6, height * 0.4);
          hole2.lineTo(width * 0.15, height * 0.4);
          hole2.lineTo(width * 0.15, height * 0.15);
          shape.holes.push(hole2);
        }
        break;
        
      case 'C':
        if (isLowercase) {
          // Lowercase 'c'
          shape.moveTo(width * 0.8, height * 0.3);
          shape.bezierCurveTo(width * 0.8, height * 0.1, width * 0.65, 0, width * 0.4, 0);
          shape.bezierCurveTo(width * 0.15, 0, 0, height * 0.15, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.65, width * 0.15, height * 0.8, width * 0.4, height * 0.8);
          shape.bezierCurveTo(width * 0.65, height * 0.8, width * 0.8, height * 0.7, width * 0.8, height * 0.5);
          shape.lineTo(width * 0.65, height * 0.5);
          shape.bezierCurveTo(width * 0.65, height * 0.6, width * 0.55, height * 0.65, width * 0.4, height * 0.65);
          shape.bezierCurveTo(width * 0.25, height * 0.65, width * 0.15, height * 0.55, width * 0.15, height * 0.4);
          shape.bezierCurveTo(width * 0.15, height * 0.25, width * 0.25, height * 0.15, width * 0.4, height * 0.15);
          shape.bezierCurveTo(width * 0.55, height * 0.15, width * 0.65, height * 0.2, width * 0.65, height * 0.3);
          shape.lineTo(width * 0.8, height * 0.3);
        } else {
          // Uppercase 'C'
          shape.moveTo(width, height * 0.8);
          shape.bezierCurveTo(width, height, width * 0.8, height, width * 0.5, height);
          shape.bezierCurveTo(width * 0.2, height, 0, height * 0.8, 0, height * 0.5);
          shape.bezierCurveTo(0, height * 0.2, width * 0.2, 0, width * 0.5, 0);
          shape.bezierCurveTo(width * 0.8, 0, width, height * 0.2, width, height * 0.2);
          shape.lineTo(width * 0.8, height * 0.3);
          shape.bezierCurveTo(width * 0.8, height * 0.15, width * 0.7, height * 0.15, width * 0.5, height * 0.15);
          shape.bezierCurveTo(width * 0.3, height * 0.15, width * 0.15, height * 0.3, width * 0.15, height * 0.5);
          shape.bezierCurveTo(width * 0.15, height * 0.7, width * 0.3, height * 0.85, width * 0.5, height * 0.85);
          shape.bezierCurveTo(width * 0.7, height * 0.85, width * 0.8, height * 0.7, width * 0.8, height * 0.7);
          shape.lineTo(width, height * 0.8);
        }
        break;
        
      case 'D':
        if (isLowercase) {
          // Lowercase 'd'
          shape.moveTo(width * 0.7, 0);
          shape.lineTo(width * 0.7, height * 1.4); // Ascender
          shape.lineTo(width * 0.85, height * 1.4);
          shape.lineTo(width * 0.85, 0);
          shape.lineTo(width * 0.4, 0);
          shape.bezierCurveTo(width * 0.15, 0, 0, height * 0.15, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.65, width * 0.15, height * 0.8, width * 0.4, height * 0.8);
          shape.lineTo(width * 0.7, height * 0.8);
          shape.lineTo(width * 0.7, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.4);
          hole.bezierCurveTo(width * 0.15, height * 0.25, width * 0.25, height * 0.15, width * 0.4, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.65);
          hole.lineTo(width * 0.4, height * 0.65);
          hole.bezierCurveTo(width * 0.25, height * 0.65, width * 0.15, height * 0.55, width * 0.15, height * 0.4);
          shape.holes.push(hole);
        } else {
          // Uppercase 'D'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.6, height);
          shape.bezierCurveTo(width * 0.85, height, width, height * 0.8, width, height * 0.5);
          shape.bezierCurveTo(width, height * 0.2, width * 0.85, 0, width * 0.6, 0);
          shape.lineTo(0, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.15);
          hole.lineTo(width * 0.6, height * 0.15);
          hole.bezierCurveTo(width * 0.75, height * 0.15, width * 0.85, height * 0.25, width * 0.85, height * 0.5);
          hole.bezierCurveTo(width * 0.85, height * 0.75, width * 0.75, height * 0.85, width * 0.6, height * 0.85);
          hole.lineTo(width * 0.15, height * 0.85);
          hole.lineTo(width * 0.15, height * 0.15);
          shape.holes.push(hole);
        }
        break;
        
      case 'E':
        if (isLowercase) {
          // Lowercase 'e'
          shape.moveTo(width * 0.8, height * 0.3);
          shape.lineTo(width * 0.15, height * 0.3);
          shape.lineTo(width * 0.15, height * 0.45);
          shape.lineTo(width * 0.7, height * 0.45);
          shape.bezierCurveTo(width * 0.8, height * 0.5, width * 0.85, height * 0.6, width * 0.85, height * 0.7);
          shape.bezierCurveTo(width * 0.85, height * 0.75, width * 0.7, height * 0.8, width * 0.4, height * 0.8);
          shape.bezierCurveTo(width * 0.15, height * 0.8, 0, height * 0.65, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.15, width * 0.15, 0, width * 0.4, 0);
          shape.bezierCurveTo(width * 0.65, 0, width * 0.8, height * 0.1, width * 0.8, height * 0.3);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.15);
          hole.bezierCurveTo(width * 0.25, height * 0.15, width * 0.7, height * 0.15, width * 0.7, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.3);
          hole.lineTo(width * 0.15, height * 0.3);
          hole.lineTo(width * 0.15, height * 0.15);
          shape.holes.push(hole);
        } else {
          // Uppercase 'E'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width, height);
          shape.lineTo(width, height * 0.85);
          shape.lineTo(width * 0.15, height * 0.85);
          shape.lineTo(width * 0.15, height * 0.6);
          shape.lineTo(width * 0.8, height * 0.6);
          shape.lineTo(width * 0.8, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.15);
          shape.lineTo(width, height * 0.15);
          shape.lineTo(width, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'F':
        if (isLowercase) {
          // Lowercase 'f'
          shape.moveTo(width * 0.3, 0);
          shape.lineTo(width * 0.3, height * 1.1);
          shape.bezierCurveTo(width * 0.3, height * 1.3, width * 0.4, height * 1.4, width * 0.6, height * 1.4);
          shape.lineTo(width * 0.8, height * 1.4);
          shape.lineTo(width * 0.8, height * 1.25);
          shape.lineTo(width * 0.6, height * 1.25);
          shape.bezierCurveTo(width * 0.5, height * 1.25, width * 0.45, height * 1.2, width * 0.45, height * 1.1);
          shape.lineTo(width * 0.45, height * 0.8);
          shape.lineTo(width * 0.7, height * 0.8);
          shape.lineTo(width * 0.7, height * 0.65);
          shape.lineTo(width * 0.45, height * 0.65);
          shape.lineTo(width * 0.45, 0);
          shape.lineTo(width * 0.3, 0);
        } else {
          // Uppercase 'F'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width, height);
          shape.lineTo(width, height * 0.85);
          shape.lineTo(width * 0.15, height * 0.85);
          shape.lineTo(width * 0.15, height * 0.6);
          shape.lineTo(width * 0.8, height * 0.6);
          shape.lineTo(width * 0.8, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.4);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'G':
        if (isLowercase) {
          // Lowercase 'g'
          shape.moveTo(width * 0.85, height * 0.8);
          shape.lineTo(width * 0.85, height * -0.3); // Descender
          shape.bezierCurveTo(width * 0.85, height * -0.5, width * 0.7, height * -0.6, width * 0.4, height * -0.6);
          shape.lineTo(width * 0.2, height * -0.6);
          shape.lineTo(width * 0.2, height * -0.45);
          shape.lineTo(width * 0.4, height * -0.45);
          shape.bezierCurveTo(width * 0.6, height * -0.45, width * 0.7, height * -0.4, width * 0.7, height * -0.3);
          shape.lineTo(width * 0.7, 0);
          shape.lineTo(width * 0.4, 0);
          shape.bezierCurveTo(width * 0.15, 0, 0, height * 0.15, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.65, width * 0.15, height * 0.8, width * 0.4, height * 0.8);
          shape.lineTo(width * 0.85, height * 0.8);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.4);
          hole.bezierCurveTo(width * 0.15, height * 0.25, width * 0.25, height * 0.15, width * 0.4, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.65);
          hole.lineTo(width * 0.4, height * 0.65);
          hole.bezierCurveTo(width * 0.25, height * 0.65, width * 0.15, height * 0.55, width * 0.15, height * 0.4);
          shape.holes.push(hole);
        } else {
          // Uppercase 'G'
          shape.moveTo(width, height * 0.8);
          shape.bezierCurveTo(width, height, width * 0.8, height, width * 0.5, height);
          shape.bezierCurveTo(width * 0.2, height, 0, height * 0.8, 0, height * 0.5);
          shape.bezierCurveTo(0, height * 0.2, width * 0.2, 0, width * 0.5, 0);
          shape.bezierCurveTo(width * 0.8, 0, width, height * 0.2, width, height * 0.4);
          shape.lineTo(width * 0.6, height * 0.4);
          shape.lineTo(width * 0.6, height * 0.55);
          shape.lineTo(width * 0.85, height * 0.55);
          shape.lineTo(width * 0.85, height * 0.3);
          shape.bezierCurveTo(width * 0.85, height * 0.15, width * 0.7, height * 0.15, width * 0.5, height * 0.15);
          shape.bezierCurveTo(width * 0.3, height * 0.15, width * 0.15, height * 0.3, width * 0.15, height * 0.5);
          shape.bezierCurveTo(width * 0.15, height * 0.7, width * 0.3, height * 0.85, width * 0.5, height * 0.85);
          shape.bezierCurveTo(width * 0.7, height * 0.85, width * 0.85, height * 0.7, width * 0.85, height * 0.7);
          shape.lineTo(width, height * 0.8);
        }
        break;
        
      case 'H':
        if (isLowercase) {
          // Lowercase 'h'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 1.4); // Ascender
          shape.lineTo(width * 0.15, height * 1.4);
          shape.lineTo(width * 0.15, height * 0.5);
          shape.lineTo(width * 0.65, height * 0.5);
          shape.lineTo(width * 0.65, height * 1.4);
          shape.lineTo(width * 0.8, height * 1.4);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.65, 0);
          shape.lineTo(width * 0.65, height * 0.35);
          shape.lineTo(width * 0.15, height * 0.35);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        } else {
          // Uppercase 'H'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(width * 0.15, height * 0.6);
          shape.lineTo(width * 0.65, height * 0.6);
          shape.lineTo(width * 0.65, height);
          shape.lineTo(width * 0.8, height);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.65, 0);
          shape.lineTo(width * 0.65, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.4);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'I':
        if (isLowercase) {
          // Lowercase 'i'
          shape.moveTo(width * 0.3, 0);
          shape.lineTo(width * 0.3, height * 0.8);
          shape.lineTo(width * 0.5, height * 0.8);
          shape.lineTo(width * 0.5, 0);
          shape.lineTo(width * 0.3, 0);
          
          // Dot above
          shape.moveTo(width * 0.3, height * 1.0);
          shape.lineTo(width * 0.5, height * 1.0);
          shape.lineTo(width * 0.5, height * 1.2);
          shape.lineTo(width * 0.3, height * 1.2);
          shape.lineTo(width * 0.3, height * 1.0);
        } else {
          // Uppercase 'I'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 0.15);
          shape.lineTo(width * 0.3, height * 0.15);
          shape.lineTo(width * 0.3, height * 0.85);
          shape.lineTo(0, height * 0.85);
          shape.lineTo(0, height);
          shape.lineTo(width, height);
          shape.lineTo(width, height * 0.85);
          shape.lineTo(width * 0.7, height * 0.85);
          shape.lineTo(width * 0.7, height * 0.15);
          shape.lineTo(width, height * 0.15);
          shape.lineTo(width, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'J':
        if (isLowercase) {
          // Lowercase 'j'
          shape.moveTo(width * 0.4, height * -0.6); // Descender
          shape.bezierCurveTo(width * 0.2, height * -0.6, 0, height * -0.5, 0, height * -0.3);
          shape.lineTo(0, height * -0.15);
          shape.bezierCurveTo(0, height * -0.35, width * 0.1, height * -0.45, width * 0.4, height * -0.45);
          shape.bezierCurveTo(width * 0.6, height * -0.45, width * 0.7, height * -0.35, width * 0.7, height * -0.15);
          shape.lineTo(width * 0.7, height * 0.8);
          shape.lineTo(width * 0.85, height * 0.8);
          shape.lineTo(width * 0.85, height * -0.15);
          shape.bezierCurveTo(width * 0.85, height * -0.45, width * 0.7, height * -0.6, width * 0.4, height * -0.6);
          
          // Dot above
          shape.moveTo(width * 0.7, height * 1.0);
          shape.lineTo(width * 0.85, height * 1.0);
          shape.lineTo(width * 0.85, height * 1.2);
          shape.lineTo(width * 0.7, height * 1.2);
          shape.lineTo(width * 0.7, height * 1.0);
        } else {
          // Uppercase 'J'
          shape.moveTo(width * 0.3, 0);
          shape.bezierCurveTo(width * 0.1, 0, 0, height * 0.1, 0, height * 0.3);
          shape.lineTo(0, height * 0.45);
          shape.bezierCurveTo(0, height * 0.2, width * 0.2, height * 0.15, width * 0.3, height * 0.15);
          shape.bezierCurveTo(width * 0.5, height * 0.15, width * 0.65, height * 0.2, width * 0.65, height * 0.45);
          shape.lineTo(width * 0.65, height * 0.85);
          shape.lineTo(width * 0.3, height * 0.85);
          shape.lineTo(width * 0.3, height);
          shape.lineTo(width, height);
          shape.lineTo(width, 0);
          shape.lineTo(width * 0.3, 0);
        }
        break;
        
      case 'K':
        if (isLowercase) {
          // Lowercase 'k'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 1.4); // Ascender
          shape.lineTo(width * 0.15, height * 1.4);
          shape.lineTo(width * 0.15, height * 0.5);
          shape.lineTo(width * 0.4, height * 0.5);
          shape.lineTo(width * 0.7, height * 0.8);
          shape.lineTo(width * 0.9, height * 0.8);
          shape.lineTo(width * 0.55, height * 0.4);
          shape.lineTo(width * 0.9, 0);
          shape.lineTo(width * 0.7, 0);
          shape.lineTo(width * 0.4, height * 0.35);
          shape.lineTo(width * 0.15, height * 0.35);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        } else {
          // Uppercase 'K'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(width * 0.15, height * 0.6);
          shape.lineTo(width * 0.4, height * 0.6);
          shape.lineTo(width * 0.8, height);
          shape.lineTo(width, height);
          shape.lineTo(width * 0.55, height * 0.5);
          shape.lineTo(width, 0);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.4, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.4);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'L':
        if (isLowercase) {
          // Lowercase 'l'
          shape.moveTo(width * 0.3, 0);
          shape.lineTo(width * 0.3, height * 1.4); // Ascender
          shape.lineTo(width * 0.5, height * 1.4);
          shape.lineTo(width * 0.5, 0);
          shape.lineTo(width * 0.3, 0);
        } else {
          // Uppercase 'L'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(width * 0.15, height * 0.15);
          shape.lineTo(width, height * 0.15);
          shape.lineTo(width, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'M':
        if (isLowercase) {
          // Lowercase 'm'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 0.8);
          shape.lineTo(width * 0.12, height * 0.8);
          shape.lineTo(width * 0.12, height * 0.15);
          shape.lineTo(width * 0.25, height * 0.15);
          shape.lineTo(width * 0.25, height * 0.8);
          shape.lineTo(width * 0.37, height * 0.8);
          shape.lineTo(width * 0.37, height * 0.15);
          shape.lineTo(width * 0.5, height * 0.15);
          shape.lineTo(width * 0.5, height * 0.8);
          shape.lineTo(width * 0.62, height * 0.8);
          shape.lineTo(width * 0.62, height * 0.15);
          shape.lineTo(width * 0.75, height * 0.15);
          shape.lineTo(width * 0.75, height * 0.8);
          shape.lineTo(width * 0.87, height * 0.8);
          shape.lineTo(width * 0.87, 0);
          shape.lineTo(0, 0);
        } else {
          // Uppercase 'M'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(width * 0.15, height * 0.3);
          shape.lineTo(width * 0.4, height * 0.8);
          shape.lineTo(width * 0.6, height * 0.8);
          shape.lineTo(width * 0.85, height * 0.3);
          shape.lineTo(width * 0.85, height);
          shape.lineTo(width, height);
          shape.lineTo(width, 0);
          shape.lineTo(width * 0.85, 0);
          shape.lineTo(width * 0.85, height * 0.7);
          shape.lineTo(width * 0.65, height * 0.3);
          shape.lineTo(width * 0.35, height * 0.3);
          shape.lineTo(width * 0.15, height * 0.7);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'N':
        if (isLowercase) {
          // Lowercase 'n'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 0.8);
          shape.lineTo(width * 0.15, height * 0.8);
          shape.lineTo(width * 0.15, height * 0.15);
          shape.lineTo(width * 0.65, height * 0.15);
          shape.lineTo(width * 0.65, height * 0.8);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(0, 0);
        } else {
          // Uppercase 'N'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(width * 0.15, height * 0.3);
          shape.lineTo(width * 0.65, height * 0.8);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.65, 0);
          shape.lineTo(width * 0.65, height * 0.7);
          shape.lineTo(width * 0.15, height * 0.2);
          shape.lineTo(0, height * 0.2);
          shape.lineTo(0, 0);
        }
        break;
        
      case 'O':
        if (isLowercase) {
          // Lowercase 'o'
          shape.moveTo(width * 0.4, 0);
          shape.bezierCurveTo(width * 0.15, 0, 0, height * 0.15, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.65, width * 0.15, height * 0.8, width * 0.4, height * 0.8);
          shape.bezierCurveTo(width * 0.65, height * 0.8, width * 0.8, height * 0.65, width * 0.8, height * 0.4);
          shape.bezierCurveTo(width * 0.8, height * 0.15, width * 0.65, 0, width * 0.4, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.4, height * 0.15);
          hole.bezierCurveTo(width * 0.55, height * 0.15, width * 0.65, height * 0.25, width * 0.65, height * 0.4);
          hole.bezierCurveTo(width * 0.65, height * 0.55, width * 0.55, height * 0.65, width * 0.4, height * 0.65);
          hole.bezierCurveTo(width * 0.25, height * 0.65, width * 0.15, height * 0.55, width * 0.15, height * 0.4);
          hole.bezierCurveTo(width * 0.15, height * 0.25, width * 0.25, height * 0.15, width * 0.4, height * 0.15);
          shape.holes.push(hole);
        } else {
          // Uppercase 'O'
          shape.moveTo(width * 0.5, 0);
          shape.bezierCurveTo(width * 0.8, 0, width, height * 0.2, width, height * 0.5);
          shape.bezierCurveTo(width, height * 0.8, width * 0.8, height, width * 0.5, height);
          shape.bezierCurveTo(width * 0.2, height, 0, height * 0.8, 0, height * 0.5);
          shape.bezierCurveTo(0, height * 0.2, width * 0.2, 0, width * 0.5, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.5, height * 0.15);
          hole.bezierCurveTo(width * 0.7, height * 0.15, width * 0.85, height * 0.3, width * 0.85, height * 0.5);
          hole.bezierCurveTo(width * 0.85, height * 0.7, width * 0.7, height * 0.85, width * 0.5, height * 0.85);
          hole.bezierCurveTo(width * 0.3, height * 0.85, width * 0.15, height * 0.7, width * 0.15, height * 0.5);
          hole.bezierCurveTo(width * 0.15, height * 0.3, width * 0.3, height * 0.15, width * 0.5, height * 0.15);
          shape.holes.push(hole);
        }
        break;
        
      case 'P':
        if (isLowercase) {
          // Lowercase 'p'
          shape.moveTo(0, height * -0.6); // Descender
          shape.lineTo(0, height * 0.8);
          shape.lineTo(width * 0.6, height * 0.8);
          shape.bezierCurveTo(width * 0.85, height * 0.8, width, height * 0.65, width, height * 0.4);
          shape.bezierCurveTo(width, height * 0.15, width * 0.85, 0, width * 0.6, 0);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(width * 0.15, height * -0.6);
          shape.lineTo(0, height * -0.6);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.15);
          hole.lineTo(width * 0.6, height * 0.15);
          hole.bezierCurveTo(width * 0.75, height * 0.15, width * 0.85, height * 0.25, width * 0.85, height * 0.4);
          hole.bezierCurveTo(width * 0.85, height * 0.55, width * 0.75, height * 0.65, width * 0.6, height * 0.65);
          hole.lineTo(width * 0.15, height * 0.65);
          hole.lineTo(width * 0.15, height * 0.15);
          shape.holes.push(hole);
        } else {
          // Uppercase 'P'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.6, height);
          shape.bezierCurveTo(width * 0.85, height, width, height * 0.8, width, height * 0.65);
          shape.bezierCurveTo(width, height * 0.5, width * 0.85, height * 0.4, width * 0.6, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.4);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.55);
          hole.lineTo(width * 0.6, height * 0.55);
          hole.bezierCurveTo(width * 0.75, height * 0.55, width * 0.85, height * 0.65, width * 0.85, height * 0.75);
          hole.bezierCurveTo(width * 0.85, height * 0.8, width * 0.75, height * 0.85, width * 0.6, height * 0.85);
          hole.lineTo(width * 0.15, height * 0.85);
          hole.lineTo(width * 0.15, height * 0.55);
          shape.holes.push(hole);
        }
        break;
        
      case 'Q':
        if (isLowercase) {
          // Lowercase 'q'
          shape.moveTo(width * 0.85, height * -0.6); // Descender
          shape.lineTo(width * 0.85, height * 0.8);
          shape.lineTo(width * 0.4, height * 0.8);
          shape.bezierCurveTo(width * 0.15, height * 0.8, 0, height * 0.65, 0, height * 0.4);
          shape.bezierCurveTo(0, height * 0.15, width * 0.15, 0, width * 0.4, 0);
          shape.lineTo(width * 0.7, 0);
          shape.lineTo(width * 0.7, height * -0.6);
          shape.lineTo(width * 0.85, height * -0.6);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.4);
          hole.bezierCurveTo(width * 0.15, height * 0.25, width * 0.25, height * 0.15, width * 0.4, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.15);
          hole.lineTo(width * 0.7, height * 0.65);
          hole.lineTo(width * 0.4, height * 0.65);
          hole.bezierCurveTo(width * 0.25, height * 0.65, width * 0.15, height * 0.55, width * 0.15, height * 0.4);
          shape.holes.push(hole);
        } else {
          // Uppercase 'Q'
          shape.moveTo(width * 0.5, 0);
          shape.bezierCurveTo(width * 0.8, 0, width, height * 0.2, width, height * 0.5);
          shape.bezierCurveTo(width, height * 0.8, width * 0.8, height, width * 0.5, height);
          shape.bezierCurveTo(width * 0.2, height, 0, height * 0.8, 0, height * 0.5);
          shape.bezierCurveTo(0, height * 0.2, width * 0.2, 0, width * 0.5, 0);
          
          // Add tail
          shape.moveTo(width * 0.7, height * 0.3);
          shape.lineTo(width * 0.9, height * 0.1);
          shape.lineTo(width, height * 0.2);
          shape.lineTo(width * 0.8, height * 0.4);
          shape.lineTo(width * 0.7, height * 0.3);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.5, height * 0.15);
          hole.bezierCurveTo(width * 0.7, height * 0.15, width * 0.85, height * 0.3, width * 0.85, height * 0.5);
          hole.bezierCurveTo(width * 0.85, height * 0.7, width * 0.7, height * 0.85, width * 0.5, height * 0.85);
          hole.bezierCurveTo(width * 0.3, height * 0.85, width * 0.15, height * 0.7, width * 0.15, height * 0.5);
          hole.bezierCurveTo(width * 0.15, height * 0.3, width * 0.3, height * 0.15, width * 0.5, height * 0.15);
          shape.holes.push(hole);
        }
        break;
        
      case 'R':
        if (isLowercase) {
          // Lowercase 'r'
          shape.moveTo(0, 0);
          shape.lineTo(0, height * 0.8);
          shape.lineTo(width * 0.15, height * 0.8);
          shape.lineTo(width * 0.15, height * 0.65);
          shape.lineTo(width * 0.4, height * 0.65);
          shape.bezierCurveTo(width * 0.6, height * 0.65, width * 0.7, height * 0.7, width * 0.7, height * 0.8);
          shape.lineTo(width * 0.85, height * 0.8);
          shape.bezierCurveTo(width * 0.85, height * 0.6, width * 0.7, height * 0.5, width * 0.4, height * 0.5);
          shape.lineTo(width * 0.15, height * 0.5);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
        } else {
          // Uppercase 'R'
          shape.moveTo(0, 0);
          shape.lineTo(0, height);
          shape.lineTo(width * 0.6, height);
          shape.bezierCurveTo(width * 0.85, height, width, height * 0.8, width, height * 0.65);
          shape.bezierCurveTo(width, height * 0.5, width * 0.85, height * 0.4, width * 0.6, height * 0.4);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.6, 0);
          shape.lineTo(width * 0.4, height * 0.4);
          shape.lineTo(width * 0.15, height * 0.4);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(0, 0);
          
          // Create hole
          const hole = new THREE.Path();
          hole.moveTo(width * 0.15, height * 0.55);
          hole.lineTo(width * 0.6, height * 0.55);
          hole.bezierCurveTo(width * 0.75, height * 0.55, width * 0.85, height * 0.65, width * 0.85, height * 0.75);
          hole.bezierCurveTo(width * 0.85, height * 0.8, width * 0.75, height * 0.85, width * 0.6, height * 0.85);
          hole.lineTo(width * 0.15, height * 0.85);
          hole.lineTo(width * 0.15, height * 0.55);
          shape.holes.push(hole);
        }
        break;
        
      case 'S':
        if (isLowercase) {
          // Lowercase 's'
          shape.moveTo(width * 0.7, height * 0.2);
          shape.bezierCurveTo(width * 0.7, height * 0.1, width * 0.6, 0, width * 0.4, 0);
          shape.bezierCurveTo(width * 0.2, 0, 0, height * 0.1, 0, height * 0.25);
          shape.bezierCurveTo(0, height * 0.35, width * 0.1, height * 0.4, width * 0.3, height * 0.4);
          shape.lineTo(width * 0.5, height * 0.4);
          shape.bezierCurveTo(width * 0.6, height * 0.4, width * 0.7, height * 0.45, width * 0.7, height * 0.55);
          shape.bezierCurveTo(width * 0.7, height * 0.65, width * 0.6, height * 0.8, width * 0.4, height * 0.8);
          shape.bezierCurveTo(width * 0.2, height * 0.8, 0, height * 0.7, 0, height * 0.6);
          shape.lineTo(width * 0.15, height * 0.6);
          shape.bezierCurveTo(width * 0.15, height * 0.65, width * 0.25, height * 0.65, width * 0.4, height * 0.65);
          shape.bezierCurveTo(width * 0.5, height * 0.65, width * 0.55, height * 0.6, width * 0.55, height * 0.55);
          shape.bezierCurveTo(width * 0.55, height * 0.5, width * 0.5, height * 0.55, width * 0.4, height * 0.55);
          shape.lineTo(width * 0.3, height * 0.55);
          shape.bezierCurveTo(width * 0.1, height * 0.55, 0, height * 0.45, 0, height * 0.25);
          shape.bezierCurveTo(0, height * 0.1, width * 0.1, 0, width * 0.4, 0);
          shape.bezierCurveTo(width * 0.6, 0, width * 0.7, height * 0.1, width * 0.7, height * 0.2);
        } else {
          // Uppercase 'S'
          shape.moveTo(width, height * 0.8);
          shape.bezierCurveTo(width, height, width * 0.8, height, width * 0.5, height);
          shape.bezierCurveTo(width * 0.2, height, 0, height * 0.8, 0, height * 0.6);
          shape.bezierCurveTo(0, height * 0.4, width * 0.2, height * 0.5, width * 0.5, height * 0.5);
          shape.bezierCurveTo(width * 0.8, height * 0.5, width, height * 0.4, width, height * 0.2);
          shape.bezierCurveTo(width, 0, width * 0.8, 0, width * 0.5, 0);
          shape.bezierCurveTo(width * 0.2, 0, 0, height * 0.2, 0, height * 0.2);
          shape.lineTo(width * 0.2, height * 0.3);
          shape.bezierCurveTo(width * 0.2, height * 0.15, width * 0.3, height * 0.15, width * 0.5, height * 0.15);
          shape.bezierCurveTo(width * 0.7, height * 0.15, width * 0.8, height * 0.25, width * 0.8, height * 0.35);
          shape.bezierCurveTo(width * 0.8, height * 0.45, width * 0.7, height * 0.35, width * 0.5, height * 0.35);
          shape.bezierCurveTo(width * 0.3, height * 0.35, width * 0.2, height * 0.55, width * 0.2, height * 0.65);
          shape.bezierCurveTo(width * 0.2, height * 0.75, width * 0.3, height * 0.85, width * 0.5, height * 0.85);
          shape.bezierCurveTo(width * 0.7, height * 0.85, width * 0.8, height * 0.75, width * 0.8, height * 0.7);
          shape.lineTo(width, height * 0.8);
        }
        break;
        
      case 'T':
        if (isLowercase) {
          // Lowercase 't'
          shape.moveTo(width * 0.3, 0);
          shape.lineTo(width * 0.3, height * 1.1);
          shape.lineTo(width * 0.45, height * 1.1);
          shape.lineTo(width * 0.45, height * 0.8);
          shape.lineTo(width * 0.7, height * 0.8);
          shape.lineTo(width * 0.7, height * 0.65);
          shape.lineTo(width * 0.45, height * 0.65);
          shape.lineTo(width * 0.45, 0);
          shape.lineTo(width * 0.3, 0);
        } else {
          // Uppercase 'T'
          shape.moveTo(0, height * 0.85);
          shape.lineTo(0, height);
          shape.lineTo(width, height);
          shape.lineTo(width, height * 0.85);
          shape.lineTo(width * 0.575, height * 0.85);
          shape.lineTo(width * 0.575, 0);
          shape.lineTo(width * 0.425, 0);
          shape.lineTo(width * 0.425, height * 0.85);
          shape.lineTo(0, height * 0.85);
        }
        break;
        
      case 'U':
        if (isLowercase) {
          // Lowercase 'u'
          shape.moveTo(0, height * 0.8);
          shape.lineTo(0, height * 0.25);
          shape.bezierCurveTo(0, height * 0.1, width * 0.1, 0, width * 0.25, 0);
          shape.lineTo(width * 0.55, 0);
          shape.bezierCurveTo(width * 0.7, 0, width * 0.8, height * 0.1, width * 0.8, height * 0.25);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(width * 0.65, height * 0.8);
          shape.lineTo(width * 0.65, height * 0.25);
          shape.bezierCurveTo(width * 0.65, height * 0.2, width * 0.6, height * 0.15, width * 0.55, height * 0.15);
          shape.lineTo(width * 0.25, height * 0.15);
          shape.bezierCurveTo(width * 0.2, height * 0.15, width * 0.15, height * 0.2, width * 0.15, height * 0.25);
          shape.lineTo(width * 0.15, height * 0.8);
          shape.lineTo(0, height * 0.8);
        } else {
          // Uppercase 'U'
          shape.moveTo(0, height);
          shape.lineTo(0, height * 0.3);
          shape.bezierCurveTo(0, height * 0.1, width * 0.2, 0, width * 0.5, 0);
          shape.bezierCurveTo(width * 0.8, 0, width, height * 0.1, width, height * 0.3);
          shape.lineTo(width, height);
          shape.lineTo(width * 0.85, height);
          shape.lineTo(width * 0.85, height * 0.3);
          shape.bezierCurveTo(width * 0.85, height * 0.2, width * 0.7, height * 0.15, width * 0.5, height * 0.15);
          shape.bezierCurveTo(width * 0.3, height * 0.15, width * 0.15, height * 0.2, width * 0.15, height * 0.3);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(0, height);
        }
        break;
        
      case 'V':
        if (isLowercase) {
          // Lowercase 'v'
          shape.moveTo(0, height * 0.8);
          shape.lineTo(width * 0.35, 0);
          shape.lineTo(width * 0.45, 0);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(width * 0.65, height * 0.8);
          shape.lineTo(width * 0.4, height * 0.2);
          shape.lineTo(width * 0.15, height * 0.8);
          shape.lineTo(0, height * 0.8);
        } else {
          // Uppercase 'V'
          shape.moveTo(0, height);
          shape.lineTo(width * 0.4, 0);
          shape.lineTo(width * 0.6, 0);
          shape.lineTo(width, height);
          shape.lineTo(width * 0.85, height);
          shape.lineTo(width * 0.5, height * 0.2);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(0, height);
        }
        break;
        
      case 'W':
        if (isLowercase) {
          // Lowercase 'w'
          shape.moveTo(0, height * 0.8);
          shape.lineTo(width * 0.15, 0);
          shape.lineTo(width * 0.25, 0);
          shape.lineTo(width * 0.35, height * 0.6);
          shape.lineTo(width * 0.45, 0);
          shape.lineTo(width * 0.55, 0);
          shape.lineTo(width * 0.65, height * 0.6);
          shape.lineTo(width * 0.75, 0);
          shape.lineTo(width * 0.85, 0);
          shape.lineTo(width, height * 0.8);
          shape.lineTo(width * 0.85, height * 0.8);
          shape.lineTo(width * 0.75, height * 0.2);
          shape.lineTo(width * 0.65, height * 0.8);
          shape.lineTo(width * 0.55, height * 0.8);
          shape.lineTo(width * 0.45, height * 0.2);
          shape.lineTo(width * 0.35, height * 0.8);
          shape.lineTo(width * 0.25, height * 0.8);
          shape.lineTo(width * 0.15, height * 0.2);
          shape.lineTo(0, height * 0.8);
        } else {
          // Uppercase 'W'
          shape.moveTo(0, height);
          shape.lineTo(width * 0.2, 0);
          shape.lineTo(width * 0.35, 0);
          shape.lineTo(width * 0.5, height * 0.7);
          shape.lineTo(width * 0.65, 0);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width, height);
          shape.lineTo(width * 0.85, height);
          shape.lineTo(width * 0.7, height * 0.2);
          shape.lineTo(width * 0.5, height);
          shape.lineTo(width * 0.3, height * 0.2);
          shape.lineTo(width * 0.15, height);
          shape.lineTo(0, height);
        }
        break;
        
      case 'X':
        if (isLowercase) {
          // Lowercase 'x'
          shape.moveTo(0, height * 0.8);
          shape.lineTo(width * 0.25, height * 0.5);
          shape.lineTo(0, 0);
          shape.lineTo(width * 0.2, 0);
          shape.lineTo(width * 0.4, height * 0.35);
          shape.lineTo(width * 0.6, 0);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.55, height * 0.5);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(width * 0.6, height * 0.8);
          shape.lineTo(width * 0.4, height * 0.65);
          shape.lineTo(width * 0.2, height * 0.8);
          shape.lineTo(0, height * 0.8);
        } else {
          // Uppercase 'X'
          shape.moveTo(0, height);
          shape.lineTo(width * 0.35, height * 0.5);
          shape.lineTo(0, 0);
          shape.lineTo(width * 0.2, 0);
          shape.lineTo(width * 0.5, height * 0.35);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width, 0);
          shape.lineTo(width * 0.65, height * 0.5);
          shape.lineTo(width, height);
          shape.lineTo(width * 0.8, height);
          shape.lineTo(width * 0.5, height * 0.65);
          shape.lineTo(width * 0.2, height);
          shape.lineTo(0, height);
        }
        break;
        
      case 'Y':
        if (isLowercase) {
          // Lowercase 'y'
          shape.moveTo(0, height * 0.8);
          shape.lineTo(width * 0.35, height * 0.3);
          shape.lineTo(width * 0.35, height * -0.6); // Descender
          shape.lineTo(width * 0.5, height * -0.6);
          shape.lineTo(width * 0.5, height * 0.3);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(width * 0.65, height * 0.8);
          shape.lineTo(width * 0.425, height * 0.5);
          shape.lineTo(width * 0.15, height * 0.8);
          shape.lineTo(0, height * 0.8);
        } else {
          // Uppercase 'Y'
          shape.moveTo(0, height);
          shape.lineTo(width * 0.425, height * 0.5);
          shape.lineTo(width * 0.425, 0);
          shape.lineTo(width * 0.575, 0);
          shape.lineTo(width * 0.575, height * 0.5);
          shape.lineTo(width, height);
          shape.lineTo(width * 0.8, height);
          shape.lineTo(width * 0.5, height * 0.65);
          shape.lineTo(width * 0.2, height);
          shape.lineTo(0, height);
        }
        break;
        
      case 'Z':
        if (isLowercase) {
          // Lowercase 'z'
          shape.moveTo(0, height * 0.8);
          shape.lineTo(0, height * 0.65);
          shape.lineTo(width * 0.6, height * 0.65);
          shape.lineTo(0, height * 0.15);
          shape.lineTo(0, 0);
          shape.lineTo(width * 0.8, 0);
          shape.lineTo(width * 0.8, height * 0.15);
          shape.lineTo(width * 0.2, height * 0.15);
          shape.lineTo(width * 0.8, height * 0.65);
          shape.lineTo(width * 0.8, height * 0.8);
          shape.lineTo(0, height * 0.8);
        } else {
          // Uppercase 'Z'
          shape.moveTo(0, height);
          shape.lineTo(0, height * 0.85);
          shape.lineTo(width * 0.7, height * 0.85);
          shape.lineTo(0, height * 0.15);
          shape.lineTo(0, 0);
          shape.lineTo(width, 0);
          shape.lineTo(width, height * 0.15);
          shape.lineTo(width * 0.3, height * 0.15);
          shape.lineTo(width, height * 0.85);
          shape.lineTo(width, height);
          shape.lineTo(0, height);
        }
        break;
        
      case ' ':
        // Space character - empty shape
        shape.moveTo(0, 0);
        shape.lineTo(width * 0.3, 0);
        shape.lineTo(width * 0.3, height * 0.1);
        shape.lineTo(0, height * 0.1);
        shape.lineTo(0, 0);
        break;
        
      default:
        // Default rectangular shape for other characters
        if (isLowercase) {
          shape.moveTo(0, 0);
          shape.lineTo(width, 0);
          shape.lineTo(width, height);
          shape.lineTo(0, height);
          shape.lineTo(0, 0);
        } else {
          shape.moveTo(0, 0);
          shape.lineTo(width, 0);
          shape.lineTo(width, height);
          shape.lineTo(0, height);
          shape.lineTo(0, 0);
        }
        break;
    }
    
    return shape;
  };

  // Enhanced function to create 3D text geometry
  const create3DText = (text: string) => {
    const group = new THREE.Group();
    
    const chars = text.split('');
    let xOffset = 0;
    const charWidth = 0.8;
    const charSpacing = 0.1;
    const extrudeDepth = 0.2;
    
    chars.forEach((char, index) => {
      if (char === ' ') {
        xOffset += charWidth * 0.5;
        return;
      }
      
      const charShape = createLetterShape(char);
      
      const extrudeSettings = {
        depth: extrudeDepth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.02,
        bevelThickness: 0.02
      };
      
      const charGeometry = new THREE.ExtrudeGeometry(charShape, extrudeSettings);
      const charMaterial = new THREE.MeshStandardMaterial({ color: '#4a90e2' });
      const charMesh = new THREE.Mesh(charGeometry, charMaterial);
      
      charMesh.position.x = xOffset;
      charMesh.position.y = -0.6; // Center vertically
      
      group.add(charMesh);
      xOffset += charWidth + charSpacing;
    });
    
    // Center the entire text group
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.x = -center.x;
    
    return group;
  };

  // Basic geometric shapes
  const basicShapes = [
    {
      name: 'Cube',
      icon: Box,
      geometry: () => new THREE.BoxGeometry(1, 1, 1),
      color: '#44aa88'
    },
    {
      name: 'Sphere',
      icon: CircleIcon,
      geometry: () => new THREE.SphereGeometry(0.5, 32, 16),
      color: '#aa4488'
    },
    {
      name: 'Cylinder',
      icon: Cylinder,
      geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      color: '#4488aa'
    },
    {
      name: 'Cone',
      icon: Cone,
      geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
      color: '#88aa44'
    },
    {
      name: 'Plane',
      icon: Triangle,
      geometry: () => new THREE.PlaneGeometry(2, 2),
      color: '#aa8844'
    },
    {
      name: 'Torus',
      icon: DonutIcon,
      geometry: () => new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      color: '#8844aa'
    },
    {
      name: 'Heart',
      icon: Heart,
      geometry: () => {
        // Create a heart shape using a custom geometry
        const heartShape = new THREE.Shape();
        
        const x = 0, y = 0;
        heartShape.moveTo(x + 5, y + 5);
        heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
        heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.7, x + 5, y + 15);
        heartShape.bezierCurveTo(x + 12, y + 7.7, x + 14, y + 5.5, x + 14, y + 3.5);
        heartShape.bezierCurveTo(x + 14, y + 3.5, x + 14, y, x + 10, y);
        heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

        const extrudeSettings = {
          depth: 2,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 2,
          bevelSize: 0.5,
          bevelThickness: 0.5
        };

        const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        
        // Scale and center the heart
        geometry.scale(0.05, 0.05, 0.05);
        geometry.center();
        
        return geometry;
      },
      color: '#ff6b9d'
    },
    {
      name: 'Star',
      icon: Star,
      geometry: () => {
        // Create a star shape
        const starShape = new THREE.Shape();
        const outerRadius = 10;
        const innerRadius = 4;
        const spikes = 5;
        
        let rot = Math.PI / 2 * 3;
        let x = 0;
        let y = outerRadius;
        const step = Math.PI / spikes;

        starShape.moveTo(0, outerRadius);
        
        for (let i = 0; i < spikes; i++) {
          x = Math.cos(rot) * outerRadius;
          y = Math.sin(rot) * outerRadius;
          starShape.lineTo(x, y);
          rot += step;

          x = Math.cos(rot) * innerRadius;
          y = Math.sin(rot) * innerRadius;
          starShape.lineTo(x, y);
          rot += step;
        }
        
        starShape.lineTo(0, outerRadius);

        const extrudeSettings = {
          depth: 2,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 2,
          bevelSize: 0.3,
          bevelThickness: 0.3
        };

        const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
        
        // Scale and center the star
        geometry.scale(0.05, 0.05, 0.05);
        geometry.center();
        
        return geometry;
      },
      color: '#ffd700'
    }
  ];

  // Nature objects - trees, flowers, and rocks (removed Pebble and Sunflower)
  const natureObjects = [
    {
      name: 'Pine Tree',
      icon: TreePine,
      geometry: () => {
        const group = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1; // Position trunk so base is at y=0
        group.add(trunk);
        
        // Tree layers (3 cone layers)
        const layerColors = ['#228B22', '#32CD32', '#90EE90'];
        const layerSizes = [0.8, 0.6, 0.4];
        const layerHeights = [0.8, 0.6, 0.4];
        const layerPositions = [1.2, 1.6, 1.9];
        
        layerSizes.forEach((size, i) => {
          const layerGeometry = new THREE.ConeGeometry(size, layerHeights[i], 8);
          const layerMaterial = new THREE.MeshStandardMaterial({ color: layerColors[i] });
          const layer = new THREE.Mesh(layerGeometry, layerMaterial);
          layer.position.y = layerPositions[i];
          group.add(layer);
        });
        
        return group;
      },
      color: '#228B22'
    },
    {
      id: 'bed',
      name: 'Bed',
      icon: Bed,
      factory: async () => await loadGLBModel('/BedSingle.glb', { scale: 1 }),
      color: '#8B4513'
    },
    {
      name: 'Simple Tree',
      icon: TreePine,
      geometry: () => createSimpleTree(),
      color: '#018156'
    },
    {
      name: 'Flower',
      icon: Flower,
      geometry: () => {
        const group = new THREE.Group();
        
        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.8, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        group.add(stem);
        
        // Flower center
        const centerGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.8;
        group.add(center);
        
        // Flower petals
        const petalGeometry = new THREE.SphereGeometry(0.12, 8, 6);
        const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });
        
        for (let i = 0; i < 6; i++) {
          const petal = new THREE.Mesh(petalGeometry, petalMaterial);
          const angle = (i / 6) * Math.PI * 2;
          petal.position.x = Math.cos(angle) * 0.15;
          petal.position.z = Math.sin(angle) * 0.15;
          petal.position.y = 0.8;
          petal.scale.set(0.8, 0.4, 0.8);
          group.add(petal);
        }
        
        return group;
      },
      color: '#FF69B4'
    },
    {
      name: 'Boulder',
      icon: Mountain,
      geometry: () => {
        // Create an irregular rock shape using a modified sphere
        const geometry = new THREE.SphereGeometry(0.6, 8, 6);
        const positions = geometry.attributes.position;
        
        // Randomly modify vertices to create irregular rock shape
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Add some randomness to make it look more rock-like
          const noise = (Math.random() - 0.5) * 0.3;
          const length = Math.sqrt(x * x + y * y + z * z);
          const newLength = length + noise;
          
          positions.setXYZ(
            i,
            (x / length) * newLength,
            (y / length) * newLength * (0.7 + Math.random() * 0.3), // Make it flatter
            (z / length) * newLength
          );
        }
        
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#696969'
    },
    {
      name: 'Small Rock',
      icon: Mountain,
      geometry: () => {
        // Create a smaller, more angular rock
        const geometry = new THREE.DodecahedronGeometry(0.3);
        const positions = geometry.attributes.position;
        
        // Slightly modify vertices for more natural look
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          const noise = (Math.random() - 0.5) * 0.1;
          const length = Math.sqrt(x * x + y * y + z * z);
          const newLength = length + noise;
          
          positions.setXYZ(
            i,
            (x / length) * newLength,
            (y / length) * newLength,
            (z / length) * newLength
          );
        }
        
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#A0A0A0'
    },
    {
      name: 'Grass Patch',
      icon: TreePine,
      geometry: () => {
        const group = new THREE.Group();
        
        // Create multiple grass blades
        const bladeGeometry = new THREE.BoxGeometry(0.02, 0.3, 0.01);
        const bladeMaterial = new THREE.MeshStandardMaterial({ color: '#32CD32' });
        
        for (let i = 0; i < 20; i++) {
          const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
          
          // Random position within a small area
          blade.position.x = (Math.random() - 0.5) * 0.6;
          blade.position.z = (Math.random() - 0.5) * 0.6;
          blade.position.y = 0.15;
          
          // Random rotation and slight scale variation
          blade.rotation.y = Math.random() * Math.PI * 2;
          blade.rotation.x = (Math.random() - 0.5) * 0.2;
          blade.scale.y = 0.8 + Math.random() * 0.4;
          
          group.add(blade);
        }
        
        return group;
      },
      color: '#32CD32'
    }
  ];

  // Food objects - GLB models for food items
  const foodObjects = [
    {
      id: 'hotdog',
      name: 'Hotdog',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Hotdog.glb', { scale: 1 }),
      color: '#FF6347'
    },
    {
      id: 'bottle',
      name: 'Bottle',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Bottle.glb', { scale: 1 }),
      color: '#4169E1'
    },
    {
      id: 'burrito',
      name: 'Burrito',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Burrito.glb', { scale: 1 }),
      color: '#D2691E'
    },
    {
      id: 'cake-birthday',
      name: 'Birthday Cake',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Cake Birthday.glb', { scale: 1 }),
      color: '#FFB6C1'
    },
    {
      id: 'chicken-truck',
      name: 'Chicken Truck',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Chicken Truck.glb', { scale: 1 }),
      color: '#FFD700'
    },
    {
      id: 'chips',
      name: 'Chips',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Chips.glb', { scale: 1 }),
      color: '#DAA520'
    },
    {
      id: 'dog-bowl',
      name: 'Dog Bowl',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Dog bowl.glb', { scale: 1 }),
      color: '#C0C0C0'
    },
    {
      id: 'donut',
      name: 'Donut',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Donut.glb', { scale: 1 }),
      color: '#DEB887'
    },
    {
      id: 'fruit-bowl',
      name: 'Fruit Bowl',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Fruit Bowl.glb', { scale: 1 }),
      color: '#FF4500'
    },
    {
      id: 'ice-cream',
      name: 'Ice Cream',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Ice Cream.glb', { scale: 1 }),
      color: '#FFB6C1'
    },
    {
      id: 'pizza',
      name: 'Pizza',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Pizza.glb', { scale: 1 }),
      color: '#FF6347'
    },
    {
      id: 'pretzel',
      name: 'Pretzel',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Pretzel.glb', { scale: 1 }),
      color: '#8B4513'
    },
    {
      id: 'salad-bowl',
      name: 'Salad Bowl',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Salad Bowl.glb', { scale: 1 }),
      color: '#32CD32'
    },
    {
      id: 'sandwich',
      name: 'Sandwich',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Sandwich.glb', { scale: 1 }),
      color: '#DEB887'
    },
    {
      id: 'soda-can',
      name: 'Soda Can',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Soda Can.glb', { scale: 1 }),
      color: '#DC143C'
    },
    {
      id: 'stew',
      name: 'Stew',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Stew.glb', { scale: 1 }),
      color: '#8B4513'
    },
    {
      id: 'taco',
      name: 'Taco',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Taco.glb', { scale: 1 }),
      color: '#DAA520'
    },
    {
      id: 'udon',
      name: 'Udon',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Udon.glb', { scale: 1 }),
      color: '#F5DEB3'
    },
    {
      id: 'vending-machine',
      name: 'Vending Machine',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Vending Machine.glb', { scale: 1 }),
      color: '#4682B4'
    },
    {
      id: 'water-bottle',
      name: 'Water Bottle',
      icon: Utensils,
      factory: async () => await loadGLBModel('/Water Bottle.glb', { scale: 1 }),
      color: '#87CEEB'
    }
  ];

  // Animal objects
  const animalObjects = [
    {
      id: 'cow',
      name: 'Cow',
      icon: Dog,
      factory: async () => await loadGLBModel('/Cow.glb', { scale: 1 }),
      color: '#FFFFFF'
    },
    {
      id: 'deer',
      name: 'Deer',
      icon: Dog,
      factory: async () => await loadGLBModel('/Deer.glb', { scale: 1 }),
      color: '#8B4513'
    },
    {
      id: 'donkey',
      name: 'Donkey',
      icon: Dog,
      factory: async () => await loadGLBModel('/Donkey.glb', { scale: 1 }),
      color: '#696969'
    },
    {
      id: 'elephant',
      name: 'Elephant',
      icon: Dog,
      factory: async () => await loadGLBModel('/Elephant.glb', { scale: 1 }),
      color: '#708090'
    },
    {
      id: 'horse',
      name: 'Horse',
      icon: Dog,
      factory: async () => await loadGLBModel('/Horse.glb', { scale: 1 }),
      color: '#8B4513'
    },
    {
      id: 'shibainu',
      name: 'Shiba Inu',
      icon: Dog,
      factory: async () => await loadGLBModel('/ShibaInu.glb', { scale: 1 }),
      color: '#DEB887'
    },
    {
      id: 'stag',
      name: 'Stag',
      icon: Dog,
      factory: async () => await loadGLBModel('/Stag.glb', { scale: 1 }),
      color: '#8B4513'
    }
  ];

  // Basic transform objects (primitives)
  const transformObjects = [
    { 
      name: 'Cube', 
      icon: Box, 
      geometry: () => new THREE.BoxGeometry(1, 1, 1),
      color: '#44aa88'
    },
    { 
      name: 'Sphere', 
      icon: Circle, 
      geometry: () => new THREE.SphereGeometry(0.5, 32, 16),
      color: '#aa4488'
    },
    { 
      name: 'Cylinder', 
      icon: Cylinder, 
      geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      color: '#4488aa'
    },
    { 
      name: 'Cone', 
      icon: Triangle, 
      geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
      color: '#88aa44'
    },
    { 
      name: 'Torus', 
      icon: Circle, 
      geometry: () => new THREE.TorusGeometry(1, 0.4, 16, 100),
      color: '#aa8844'
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('loading');
    setUploadMessage('Loading 3D model...');

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileUrl = URL.createObjectURL(file);
      
      let loader: any;
      let loadedObject: THREE.Object3D | null = null;

      switch (fileExtension) {
        case 'glb':
        case 'gltf':
          loader = new GLTFLoader();
          const gltf = await new Promise<any>((resolve, reject) => {
            loader.load(fileUrl, resolve, undefined, reject);
          });
          loadedObject = gltf.scene;
          break;

        case 'obj':
          loader = new OBJLoader();
          loadedObject = await new Promise<THREE.Object3D>((resolve, reject) => {
            loader.load(fileUrl, resolve, undefined, reject);
          });
          break;

        case 'fbx':
          loader = new FBXLoader();
          loadedObject = await new Promise<THREE.Object3D>((resolve, reject) => {
            loader.load(fileUrl, resolve, undefined, reject);
          });
          break;

        case 'stl':
          loader = new STLLoader();
          const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            loader.load(fileUrl, resolve, undefined, reject);
          });
          const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
          loadedObject = new THREE.Mesh(geometry, material);
          break;

        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      if (loadedObject) {
        // Process the loaded object
        const processedObject = processImportedModel(loadedObject, file.name);
        
        // Start placement mode
        startObjectPlacement({
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          geometry: () => processedObject,
          color: '#44aa88'
        });

        setUploadStatus('success');
        setUploadMessage('Model loaded successfully!');
        setShowObjectLibrary(false);
        
        // Reset status after delay
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 2000);
      }

      // Clean up object URL
      URL.revokeObjectURL(fileUrl);
      
    } catch (error) {
      console.error('Error loading 3D model:', error);
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Failed to load model');
      
      // Reset status after delay
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
    }

    // Reset file input
    event.target.value = '';
  };

  const processImportedModel = (object: THREE.Object3D, fileName: string): THREE.Object3D => {
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Scale to fit within 3 units maximum
    const maxDimension = Math.max(size.x, size.y, size.z);
    if (maxDimension > 3) {
      const scale = 3 / maxDimension;
      object.scale.setScalar(scale);
    }
    
    // Center the object
    object.position.sub(center);
    
    // Ensure all meshes have proper materials
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!child.material || Array.isArray(child.material)) {
          child.material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        }
        
        // Ensure geometry has normals
        if (!child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
      }
    });
    
    return object;
  };

  const handleModelSelect = async (path: string, name: string) => {
    try {
      // Import the model loader utility
      const { loadGLBModel } = await import('../utils/modelLoader');
      
      // Load the model
      const model = await loadGLBModel(path, {
        scale: 1,
        position: { x: 0, y: 0, z: 0 }
      });
      
      // Start placement mode with the loaded model
      startObjectPlacement({
        geometry: () => model,
        name,
        color: '#44aa88'
      });
      
      setShowObjectLibrary(false);
    } catch (error) {
      console.error('Error loading model:', error);
      // Fallback to a basic cube if model loading fails
      const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
      startObjectPlacement({
        geometry: fallbackGeometry,
        name: `${name} (Fallback)`,
        color: '#ff6b6b'
      });
      setShowObjectLibrary(false);
    }
  };

  const handleObjectSelect = (shape: typeof basicShapes[0] | typeof natureObjects[0]) => {
    // Handle special case for bed (async factory)
    if ('factory' in shape && shape.factory) {
      setUploadStatus('loading');
      setUploadMessage('Loading bed model...');
      
      shape.factory().then((loadedObject: THREE.Object3D) => {
        // Process the loaded bed model
        const processedBed = processImportedModel(loadedObject, shape.name);
        
        startObjectPlacement({
          geometry: () => processedBed,
          name: shape.name,
          color: shape.color
        });
        
        setUploadStatus('success');
        setUploadMessage('Bed model loaded successfully!');
        setShowObjectLibrary(false);
        
        // Reset status after delay
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 2000);
      }).catch((error) => {
        console.error('Error loading bed model:', error);
        setUploadStatus('error');
        setUploadMessage('Failed to load bed model');
        
        // Reset status after delay
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 3000);
      });
    } else {
      // Handle regular geometry objects
      startObjectPlacement({
        geometry: shape.geometry,
        name: shape.name,
        color: shape.color
      });
      setShowObjectLibrary(false);
    }
  };

  const handleTextCreate = () => {
    if (!textInput.trim()) return;
    
    startObjectPlacement({
      geometry: () => create3DText(textInput.trim()),
      name: `3D Text: ${textInput.trim()}`,
      color: '#4a90e2'
    });
    setShowObjectLibrary(false);
    setShowTextInput(false);
  };

  const handleLightAdd = (type: 'directional' | 'point' | 'spot') => {
    const position = selectedObject 
      ? [
          selectedObject.position.x + 2,
          selectedObject.position.y + 2,
          selectedObject.position.z + 2
        ]
      : [2, 2, 2];

    addLight(type, position);
  };

  const handleCloseLibrary = () => {
    setShowObjectLibrary(false);
  };

  const transformTools = [
    {
      icon: MousePointer,
      mode: null,
      title: 'Select',
      shortcut: 'Q'
    },
    {
      icon: Move,
      mode: 'translate' as const,
      title: 'Move',
      shortcut: 'G'
    },
    {
      icon: RotateCw,
      mode: 'rotate' as const,
      title: 'Rotate',
      shortcut: 'R'
    },
    {
      icon: Scale,
      mode: 'scale' as const,
      title: 'Scale',
      shortcut: 'S'
    }
  ];

  const editTools = [
    {
      icon: Dot,
      mode: 'vertex' as const,
      title: 'Edit Vertices',
      shortcut: 'V'
    },
    {
      icon: Minus,
      mode: 'edge' as const,
      title: 'Edit Edges',
      shortcut: 'E'
    }
  ];

  const lightTools = [
    {
      icon: Sun,
      type: 'directional' as const,
      title: 'Directional Light',
      description: 'Parallel rays like sunlight'
    },
    {
      icon: Lightbulb,
      type: 'point' as const,
      title: 'Point Light',
      description: 'Omnidirectional like a bulb'
    },
    {
      icon: Zap,
      type: 'spot' as const,
      title: 'Spot Light',
      description: 'Focused cone of light'
    }
  ];

  const tabs = [
    { id: 'basic', name: 'Basic', icon: Box },
    { id: 'nature', name: 'Nature', icon: TreePine },
    { id: 'food', name: 'Food', icon: Utensils },
    { id: 'animals', name: 'Animals', icon: Dog },
    { id: 'text', name: 'Text', icon: Type }
  ];

  return (
    <>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-3 border border-white/5 z-10">
        <div className="flex flex-col gap-2">
          {/* Add Object Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTransformObjects(!showTransformObjects)}
              className="p-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all duration-200 flex items-center justify-center group relative hover:scale-105 active:scale-95"
              title="Transform Objects"
            >
              <Library className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Transform Objects
              </div>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowObjectLibrary(true)}
              className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center justify-center group relative hover:scale-105 active:scale-95"
              title="Object Library"
            >
              <Shapes className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Object Library
              </div>
            </button>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-white/10" />

          {/* Transform Tools */}
          {transformTools.map(({ icon: Icon, mode, title, shortcut }) => (
            <button
              key={title}
              onClick={() => {
                setEditMode(null); // Clear edit mode when selecting transform tool
                setTransformMode(mode);
              }}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative hover:scale-105 active:scale-95 ${
                transformMode === mode
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              title={`${title} (${shortcut})`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {title} ({shortcut})
              </div>
            </button>
          ))}

          {/* Separator */}
          <div className="w-full h-px bg-white/10" />

          {/* Edit Tools */}
          {editTools.map(({ icon: Icon, mode, title, shortcut }) => {
            // Check if edge mode should be disabled for certain geometries
            const isDisabled = mode === 'edge' && selectedObject instanceof THREE.Mesh && (
              selectedObject.geometry instanceof THREE.CylinderGeometry ||
              selectedObject.geometry instanceof THREE.ConeGeometry ||
              selectedObject.geometry instanceof THREE.SphereGeometry
            );

            return (
              <button
                key={title}
                onClick={() => !isDisabled && setEditMode(mode)}
                disabled={isDisabled}
                className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                  isDisabled
                    ? 'text-white/30 cursor-not-allowed'
                    : editMode === mode
                      ? 'bg-green-500/30 text-green-300 hover:scale-105 active:scale-95'
                      : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
                }`}
                title={isDisabled ? `${title} (Not available for this geometry)` : `${title} (${shortcut})`}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {isDisabled ? `${title} (Not available)` : `${title} (${shortcut})`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transform Objects Modal */}
      {showTransformObjects && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 w-full max-w-md max-h-[70vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Library className="w-6 h-6 text-green-400" />
                Transform Objects
              </h2>
              <button
                onClick={() => setShowTransformObjects(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basic Objects Grid */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              <div className="grid grid-cols-2 gap-4">
                {transformObjects.map(({ name, icon: Icon, geometry, color }) => (
                  <button
                    key={name}
                    onClick={() => {
                      startObjectPlacement({
                        geometry,
                        name,
                        color
                      });
                      setShowTransformObjects(false);
                    }}
                    className="flex flex-col items-center gap-3 p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 group"
                    title={`Add ${name}`}
                  >
                    <Icon className="w-10 h-10 text-white/70 group-hover:text-white/90" />
                    <span className="text-sm text-white/60 group-hover:text-white/80 text-center font-medium">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Object Library Modal */}
      {showObjectLibrary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Shapes className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-semibold text-white">Object Library</h2>
              </div>
              <button
                onClick={handleCloseLibrary}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              <div className="text-center mb-8">
                <p className="text-white/70 text-lg">
                  Select an object to place in your scene
                </p>
              </div>

              {/* File Import Section */}
              <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import 3D Models
                </h3>
                
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="file"
                      accept=".glb,.gltf,.obj,.fbx,.stl"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadStatus === 'loading'}
                    />
                    <div className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                      uploadStatus === 'loading'
                        ? 'border-blue-500/50 bg-blue-500/10 cursor-wait'
                        : uploadStatus === 'success'
                          ? 'border-green-500/50 bg-green-500/10'
                          : uploadStatus === 'error'
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5'
                    }`}>
                      {uploadStatus === 'loading' ? (
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                      ) : uploadStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : uploadStatus === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <Upload className="w-5 h-5 text-white/70" />
                      )}
                      <span className={`text-sm font-medium ${
                        uploadStatus === 'success' ? 'text-green-400' :
                        uploadStatus === 'error' ? 'text-red-400' :
                        uploadStatus === 'loading' ? 'text-blue-400' :
                        'text-white/90'
                      }`}>
                        {uploadStatus === 'loading' ? 'Loading...' :
                         uploadStatus === 'success' ? 'Success!' :
                         uploadStatus === 'error' ? 'Error' :
                         'Click to Upload or Drag & Drop'}
                      </span>
                    </div>
                  </label>
                  
                  {uploadMessage && (
                    <div className={`text-xs p-2 rounded ${
                      uploadStatus === 'success' ? 'text-green-400 bg-green-500/10' :
                      uploadStatus === 'error' ? 'text-red-400 bg-red-500/10' :
                      'text-blue-400 bg-blue-500/10'
                    }`}>
                      {uploadMessage}
                    </div>
                  )}
                  
                  <div className="text-xs text-white/60">
                    Supported formats: GLB, GLTF, OBJ, FBX, STL
                  </div>
                </div>
              </div>

              {/* Imported 3D Models */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Imported Models
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {importedModels.map(({ name, path, icon: Icon }) => (
                    <button
                      key={name}
                      onClick={() => handleModelSelect(path, name)}
                      className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors flex flex-col items-center gap-2 group"
                      title={`Add ${name}`}
                    >
                      <Icon className="w-6 h-6 text-white/70 group-hover:text-white/90" />
                      <span className="text-xs text-white/70 group-hover:text-white/90 text-center leading-tight">{name}</span>
                    </button>
                  ))}
                </div>
                
                {importedModels.length === 0 && (
                  <div className="text-center py-6 text-white/50">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No imported models</p>
                    <p className="text-xs mt-1">Import .glb files to see them here</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-blue-400 bg-blue-500/20 border-b-2 border-blue-500'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {basicShapes.map((type) => (
                    <button
                      key={type.name}
                      onClick={() => handleObjectSelect(type)}
                      className="group flex flex-col items-center p-8 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: type.color + '20' }}
                      >
                        <type.icon 
                          className="w-8 h-8" 
                          style={{ color: type.color }} 
                        />
                      </div>
                      <span className="text-lg font-semibold text-white/90 group-hover:text-blue-400 transition-colors">
                        {type.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'nature' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {natureObjects.map((obj) => (
                    <button
                      key={obj.name}
                      onClick={() => handleObjectSelect(obj)}
                      className="group flex flex-col items-center p-8 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: obj.color + '20' }}
                      >
                        <obj.icon 
                          className="w-8 h-8" 
                          style={{ color: obj.color }} 
                        />
                      </div>
                      <span className="text-lg font-semibold text-white/90 group-hover:text-blue-400 transition-colors text-center">
                        {obj.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'food' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {foodObjects.map((obj) => (
                    <button
                      key={obj.name}
                      onClick={() => handleObjectSelect(obj)}
                      className="group flex flex-col items-center p-8 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: obj.color + '20' }}
                      >
                        <obj.icon 
                          className="w-8 h-8" 
                          style={{ color: obj.color }} 
                        />
                      </div>
                      <span className="text-lg font-semibold text-white/90 group-hover:text-blue-400 transition-colors text-center">
                        {obj.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'animals' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {animalObjects.map((obj) => (
                    <button
                      key={obj.name}
                      onClick={() => handleObjectSelect(obj)}
                      className="group flex flex-col items-center p-8 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: obj.color + '20' }}
                      >
                        <obj.icon 
                          className="w-8 h-8" 
                          style={{ color: obj.color }} 
                        />
                      </div>
                      <span className="text-lg font-semibold text-white/90 group-hover:text-blue-400 transition-colors text-center">
                        {obj.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'text' && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center">
                    <div 
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#4a90e2' + '20' }}
                    >
                      <Type className="w-10 h-10" style={{ color: '#4a90e2' }} />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Create 3D Text</h4>
                    <p className="text-white/70 mb-6">
                      Enter text to convert into a 3D extruded object
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Text Content
                      </label>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTextCreate();
                          }
                        }}
                        placeholder="Enter your text..."
                        className="w-full border border-white/20 bg-white/5 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        maxLength={20}
                      />
                      <div className="text-sm text-white/50 mt-1">
                        {textInput.length}/20 characters
                      </div>
                    </div>

                    <button
                      onClick={handleTextCreate}
                      disabled={!textInput.trim()}
                      className={`w-full py-3 px-6 rounded-lg font-medium text-lg transition-all duration-200 ${
                        textInput.trim()
                          ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      Create 3D Text
                    </button>
                  </div>

                  <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="font-medium mb-2">🔤 Complete Alphabet Support:</div>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>All 26 letters</strong> - A-Z with unique shapes</li>
                      <li>• <strong>Uppercase & Lowercase</strong> - Proper typography</li>
                      <li>• <strong>Authentic Letters</strong> - A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z</li>
                      <li>• <strong>Professional 3D</strong> - Extruded with bevels</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-blue-300 text-center">
                  Click on an object above to start placing it in your scene
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Simple Tree creation function based on the provided SimpleTree class
const createSimpleTree = () => {
  const treeGroup = new THREE.Group();
  const leafGeos: THREE.BufferGeometry[] = [];
  const branchGeos: THREE.BufferGeometry[] = [];
  
  const branchHeight = 20;
  const depth = 4; // maxDepth for leaf generation
  
  // Main trunk
  const branchGeo = new THREE.CylinderGeometry(0.6, 1, branchHeight, 8);
  const branchMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  branchGeo.translate(0, branchHeight / 2, 0);
  branchGeos.push(branchGeo);
  
  // Two small branches
  const smallBranch1 = branchGeo.clone();
  smallBranch1.scale(0.3, 0.3, 0.3);
  smallBranch1.rotateZ(Math.PI / 4);
  smallBranch1.translate(0, branchHeight / 4 + branchHeight / 20, 0);
  branchGeos.push(smallBranch1);
  
  const smallBranch2 = branchGeo.clone();
  smallBranch2.scale(0.3, 0.3, 0.3);
  smallBranch2.rotateZ(-1 * Math.PI / 8);
  smallBranch2.translate(0, branchHeight / 4, 0);
  branchGeos.push(smallBranch2);
  
  // Leaf geometry
  const leafGeo = new THREE.DodecahedronGeometry(6, 0);
  const leafMat = new THREE.MeshStandardMaterial({ 
    color: 0x018156, 
    roughness: 1, 
    metalness: 0 
  });
  
  // Generate leaves
  const startHeight = branchHeight / 5;
  const incHeight = (branchHeight * (4 / 5)) / depth;
  
  for (let i = 0; i < depth; i++) {
    const numShapes = depth - i;
    const radius = (branchHeight / 4) * (1 - (i + 1) / depth);
    
    for (let j = 0; j < numShapes; j++) {
      const rotationAmt = (2 * Math.PI / numShapes) * (j + Math.random());
      const rotation = new THREE.Vector3(radius, 0, 0).applyEuler(new THREE.Euler(0, rotationAmt, 0));
      const scale = new THREE.Vector3(
        1 + (Math.random() - 0.5) / 4,
        1,
        1 + (Math.random() - 0.5) / 4
      );
      
      const leafClone = leafGeo.clone();
      leafClone.translate(
        rotation.x, 
        branchHeight / 2 + startHeight + incHeight * i, 
        rotation.z
      );
      leafClone.scale(scale.x, scale.y, scale.z);
      leafGeos.push(leafClone);
    }
  }
  
  // Merge geometries for better performance
  try {
    // Merge leaf geometries
    const leafGeoMerged = THREE.BufferGeometryUtils.mergeGeometries(leafGeos);
    const leaves = new THREE.Mesh(leafGeoMerged, leafMat);
    
    // Merge branch geometries
    const branchGeoMerged = THREE.BufferGeometryUtils.mergeGeometries(branchGeos);
    const branches = new THREE.Mesh(branchGeoMerged, branchMat);
    
    treeGroup.add(branches, leaves);
  } catch (error) {
    // Fallback: add individual meshes if merging fails
    console.warn('Geometry merging failed, using individual meshes:', error);
    
    // Add branches individually
    branchGeos.forEach(geo => {
      const branch = new THREE.Mesh(geo, branchMat);
      treeGroup.add(branch);
    });
    
    // Add leaves individually
    leafGeos.forEach(geo => {
      const leaf = new THREE.Mesh(geo, leafMat);
      treeGroup.add(leaf);
    });
  }
  
  // Scale down to reasonable size for the scene
  treeGroup.scale.setScalar(0.1);
  
  return treeGroup;
};

export default Toolbar;