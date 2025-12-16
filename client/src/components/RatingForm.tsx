import React, { useState } from 'react';
import type { Rating } from '../types';

interface RatingFormProps {
    videoId: number;
    onSubmit: (rating: Omit<Rating, 'participant_id' | 'attention_check'>) => void;
    isSubmitting?: boolean;
}

const RatingForm: React.FC<RatingFormProps> = ({ videoId, onSubmit, isSubmitting = false }) => {
    const [accuracy, setAccuracy] = useState(3);
    const [bias, setBias] = useState(0);
    const [representativeness, setRepresentativeness] = useState(3);
    const [stereotypes, setStereotypes] = useState(1);
    const [comments, setComments] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        onSubmit({
            video_id: videoId,
            accuracy,
            bias,
            representativeness,
            stereotypes,
            comments
        });
        // Reset form
        setAccuracy(3);
        setBias(0);
        setRepresentativeness(3);
        setStereotypes(1);
        setComments('');
    };

    const renderSlider = (label: string, value: number, setValue: (val: number) => void, min: number, max: number, minLabel: string, maxLabel: string, centerLabel?: string) => (
        <div className="mb-8">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                {label} <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-2">{value > 0 && min < 0 ? `+${value}` : value}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                disabled={isSubmitting}
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span>{minLabel}</span>
                {centerLabel && <span>{centerLabel}</span>}
                <span>{maxLabel}</span>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Rate this Video</h3>

            <div className="space-y-6">
                {renderSlider('Accuracy', accuracy, setAccuracy, 1, 5, 'Not Accurate', 'Very Accurate')}
                {renderSlider('Bias', bias, setBias, -2, 2, 'Strongly Unfavorable', 'Strongly Favorable', 'Neutral')}
                {renderSlider('Representativeness', representativeness, setRepresentativeness, 1, 5, 'Not Representative', 'Very Representative')}
                {renderSlider('Stereotypes', stereotypes, setStereotypes, 1, 5, 'No Stereotypes', 'Heavy Stereotypes')}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional comments or concerns you've about this video
                    </label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                        placeholder="Any additional thoughts..."
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-bold py-3 px-4 rounded-lg shadow transition-colors ${isSubmitting
                            ? 'bg-indigo-400 cursor-not-allowed text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </span>
                    ) : 'Submit Rating'}
                </button>
            </div>
        </form>
    );
};

export default RatingForm;
