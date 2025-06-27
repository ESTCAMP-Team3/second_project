import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = '로딩 중...', className = '' }) => {
    return (
        <div className={`flex justify-center items-center py-12 ${className}`}>
            <Loader2 className="animate-spin text-blue-600 mr-3" size={48} />
            <span className="text-lg text-gray-600 dark:text-gray-300">
        {message}
      </span>
        </div>
    );
};

export default Loading;