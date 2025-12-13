import React, { useState } from 'react';

interface DebriefPageProps {
    onSubmit: (feedback: string, compensationId: string) => void;
    onBack: () => void;
}

const DebriefPage: React.FC<DebriefPageProps> = ({ onSubmit, onBack }) => {
    const [feedback, setFeedback] = useState('');
    const [compensationId, setCompensationId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        onSubmit(feedback, compensationId);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Final Steps</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="feedback" className="block text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Do you have any feedback about the study or the videos you saw? (Optional)
                        </label>
                        <textarea
                            id="feedback"
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="Your thoughts..."
                        />
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <label htmlFor="compensation" className="block text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Compensation ID (Optional)
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Please enter your Prolific ID, MTurk ID, or other identifier to receive compensation.
                        </p>
                        <input
                            type="text"
                            id="compensation"
                            value={compensationId}
                            onChange={(e) => setCompensationId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 5e9b..."
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-1/3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit & Finish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DebriefPage;
