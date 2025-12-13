import React, { useState } from 'react';
import AttentionCheck from './AttentionCheck';

interface TutorialPageProps {
    onComplete: (score: number) => void;
}

const TutorialPage: React.FC<TutorialPageProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'video' | 'check'>('video');

    const handleVideoComplete = () => {
        setStep('check');
    };

    if (step === 'video') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Tutorial</h1>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Please watch this short video to understand how to evaluate the generated media.
                            You will be asked a question about it afterwards.
                        </p>

                        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden mb-8">
                            {/* Placeholder for tutorial video - using a sample video for now */}
                            <video
                                controls
                                className="w-full h-full object-contain"
                                onEnded={handleVideoComplete}
                            >
                                <source src="http://localhost:3001/sample1.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleVideoComplete}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                I've Watched the Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <AttentionCheck onSubmit={onComplete} />
        </div>
    );
};

export default TutorialPage;
