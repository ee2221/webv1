import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Student, Project, Assignment } from '../types/student';
import { 
  getStudentByEmail, 
  saveStudent, 
  subscribeToStudentProjects,
  subscribeToAssignments
} from '../services/studentService';

export const useStudent = (user: User | null) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load student data when user changes
  useEffect(() => {
    const loadStudent = async () => {
      if (!user) {
        setStudent(null);
        setProjects([]);
        setAssignments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to find existing student by email
        let studentData = await getStudentByEmail(user.email!);
        
        // If no student record exists, create one
        if (!studentData) {
          studentData = await saveStudent({
            name: user.displayName || user.email?.split('@')[0] || 'Student',
            email: user.email || '',
            studentId: `STU${Date.now()}`,
            enrollmentDate: new Date().toISOString()
          });
        }
        
        setStudent(studentData);
      } catch (error) {
        // Handle Firebase permissions error by creating a local fallback
        console.warn('Firebase permissions issue, using fallback student profile:', error);
        
        const fallbackStudent: Student = {
          id: user.uid,
          name: user.displayName || user.email || 'Student',
          email: user.email || '',
          studentId: `STU${Date.now()}`,
          enrollmentDate: new Date().toISOString()
        };
        
        setStudent(fallbackStudent);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [user]);

  useEffect(() => {
    if (!student) return;

    const unsubscribeProjects = subscribeToStudentProjects(student.id, (projectsData) => {
      setProjects(projectsData);
    });

    return () => unsubscribeProjects();
  }, [student]);

  // Subscribe to assignments when student is loaded
  useEffect(() => {
    if (!student) return;

    const unsubscribeAssignments = subscribeToAssignments(student.course, (assignmentsData) => {
      setAssignments(assignmentsData);
    });

    return () => unsubscribeAssignments();
  }, [student]);

  return {
    student,
    projects,
    assignments,
    loading,
    error
  };
};