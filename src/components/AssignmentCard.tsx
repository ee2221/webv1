import React from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Award,
  FileText,
  Target
} from 'lucide-react';
import { Assignment } from '../types/student';

interface AssignmentCardProps {
  assignment: Assignment;
  compact?: boolean;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, compact = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: compact ? undefined : 'numeric',
      hour: compact ? undefined : '2-digit',
      minute: compact ? undefined : '2-digit'
    });
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  const getStatusColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-100 border-red-200';
    if (isDueSoon) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const getStatusIcon = () => {
    if (isOverdue) return AlertCircle;
    if (isDueSoon) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (isOverdue) return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 ${
      compact ? 'p-4' : 'p-6'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {assignment.title}
          </h3>
          <p className={`text-gray-600 mt-1 ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {assignment.description}
          </p>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor()}`}>
          {React.createElement(getStatusIcon(), { className: 'w-3 h-3' })}
          {getStatusText()}
        </div>
      </div>

      {!compact && (
        <>
          {/* Requirements */}
          {assignment.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
              <ul className="space-y-1">
                {assignment.requirements.slice(0, 3).map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Target className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
                {assignment.requirements.length > 3 && (
                  <li className="text-sm text-gray-500 ml-5">
                    +{assignment.requirements.length - 3} more requirements
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t border-gray-200 ${
        compact ? 'text-xs' : 'text-sm'
      }`}>
        <div className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Due {formatDate(assignment.dueDate)}
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            {assignment.maxGrade} pts
          </span>
        </div>
        
        <span className="text-gray-500">{assignment.course}</span>
      </div>
    </div>
  );
};

export default AssignmentCard;