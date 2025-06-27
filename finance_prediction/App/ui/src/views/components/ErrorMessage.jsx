import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({
                          title = '오류 발생',
                          message,
                          onRetry,
                          className = ''
                      }) => {
    return (
        <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
            <div className="flex items-start">
                <AlertTriangle className="text-red-500 mr-3 flex-shrink-0" size={24} />
                <div className="flex-1">
                    <h3 className="text-red-600 dark:text-red-400 font-bold mb-1">
                        {title}
                    </h3>
                    <p className="text-red-600 dark:text-red-400">
                        {message}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            다시 시도
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;