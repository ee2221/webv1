import React from 'react';
import { GraduationCap, Wrench } from 'lucide-react';

interface StudentModeToggleProps {
  currentMode: 'modeling' | 'student-portal';
  onModeChange: (mode: 'modeling' | 'student-portal') => void;
}

const StudentModeToggle: React.FC<StudentModeToggleProps> = ({ currentMode, onModeChange }) => {
  // Only show the toggle when in modeling mode
  if (currentMode === 'student-portal') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 z-50">
      <button
        onClick={() => onModeChange('student-portal')}
        className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white/90 hover:bg-white/5 rounded-xl transition-all duration-200"
        title="Open Student Portal"
      >
        <GraduationCap className="w-5 h-5" />
        <span className="text-sm font-medium">Student Portal</span>
      </button>
    </div>
  );
};

export default StudentModeToggle;