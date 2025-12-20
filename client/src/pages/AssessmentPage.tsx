import React from 'react';
import VideoPlayer from '../components/VideoPlayer';
import RatingForm from '../components/RatingForm';
import type { Video, Rating } from '../types';
import { API_BASE_URL } from '../config';

interface AssessmentPageProps {
    videos: Video[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    onRatingSubmit: (ratingData: Omit<Rating, 'participant_id'>) => Promise<void>;
    isSubmitting: boolean;
}

const AssessmentPage = ({
    videos,
    currentIndex,
    setCurrentIndex,
    onRatingSubmit,
    isSubmitting
}: AssessmentPageProps) => {
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    if (videos.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Video Assessment
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Video {currentIndex + 1} of {videos.length}
                        </p>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
                    <div
                        className="bg-indigo-600 h-1.5 transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / videos.length) * 100}%` }}
                    ></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Bar */}
                <div className="flex justify-between mb-6">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className={`flex items-center px-4 py-2 rounded-lg ${currentIndex === 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column: Video */}
                    <div className="w-full lg:w-3/5 xl:w-2/3 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <VideoPlayer
                                src={videos[currentIndex].url || `${API_BASE_URL}/videos/${videos[currentIndex].filename}`}
                                onError={() => console.log('Video load error')}
                            />
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {videos[currentIndex]?.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {videos[currentIndex]?.context}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Rating Form */}
                    <div className="w-full lg:w-2/5 xl:w-1/3 sticky top-24">
                        <RatingForm
                            key={videos[currentIndex]?.id}
                            videoId={videos[currentIndex]?.id}
                            onSubmit={onRatingSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssessmentPage;
