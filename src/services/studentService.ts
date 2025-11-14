import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Student, Project, Assignment } from '../types/student';

// Collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  PROJECTS: 'projects',
  ASSIGNMENTS: 'assignments'
} as const;

// Student CRUD operations
export const saveStudent = async (studentData: Omit<Student, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
      ...studentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<void> => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, id);
    await updateDoc(studentRef, {
      ...studentData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const getStudent = async (id: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.STUDENTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Student;
    }
    return null;
  } catch (error) {
    console.error('Error getting student:', error);
    throw error;
  }
};

export const getStudentByEmail = async (email: string): Promise<Student | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Student;
    }
    return null;
  } catch (error) {
    console.warn('Error getting student by email:', error);
    throw error;
  }
};

// Project CRUD operations
export const saveProject = async (projectData: Omit<Project, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<void> => {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getStudentProjects = async (studentId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('studentId', '==', studentId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as Project;
    });
  } catch (error) {
    console.error('Error getting student projects:', error);
    throw error;
  }
};

export const subscribeToStudentProjects = (
  studentId: string, 
  callback: (projects: Project[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.PROJECTS),
    where('studentId', '==', studentId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
        } as Project;
      });
      callback(projects);
    },
    (error) => {
      console.warn('Error in projects subscription:', error);
      // Return empty array while index is building
      callback([]);
    }
  );
};

// Assignment CRUD operations
export const getAssignments = async (course?: string): Promise<Assignment[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      orderBy('dueDate', 'asc')
    );
    
    if (course) {
      q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS),
        where('course', '==', course),
        orderBy('dueDate', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Assignment));
  } catch (error) {
    console.error('Error getting assignments:', error);
    throw error;
  }
};

export const subscribeToAssignments = (
  course: string | undefined,
  callback: (assignments: Assignment[]) => void
) => {
  let q = query(
    collection(db, COLLECTIONS.ASSIGNMENTS),
    orderBy('dueDate', 'asc')
  );
  
  if (course) {
    q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where('course', '==', course),
      orderBy('dueDate', 'asc')
    );
  }
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const assignments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Assignment));
      callback(assignments);
    },
    (error) => {
      console.warn('Error in assignments subscription:', error);
      // Return empty array while index is building
      callback([]);
    }
  );
};