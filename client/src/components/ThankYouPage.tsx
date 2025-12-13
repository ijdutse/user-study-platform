import React from 'react';

const ThankYouPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md transform hover:scale-105 transition-transform duration-300">
                <div className="mb-6 text-green-500">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Thank You!</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your participation is complete.
                </p>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You may now close this window.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
