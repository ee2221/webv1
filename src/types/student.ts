export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  enrollmentDate: string;
  avatar?: string;
  course?: string;
  year?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  tags: string[];
  status: 'draft' | 'in-progress' | 'completed' | 'submitted';
  grade?: number;
  feedback?: string;
  sceneData: {
    objects: any[];
    lights: any[];
    groups: any[];
    settings: any;
  };
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  requirements: string[];
  maxGrade: number;
  course: string;
}