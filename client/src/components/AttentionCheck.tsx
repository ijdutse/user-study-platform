import React, { useState } from 'react';

interface AttentionCheckProps {
    onSubmit: (score: number) => void;
}

const AttentionCheck: React.FC<AttentionCheckProps> = ({ onSubmit }) => {
    const [value, setValue] = useState<number>(0);

    const handleSubmit = () => {
        onSubmit(value);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">One Final Check</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-300 text-center">
                To ensure data quality, please select the number <strong>4</strong> on the slider below.
            </p>

            <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>0</span>
                    <span>10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                />
                <div className="text-center mt-4 font-bold text-2xl text-indigo-600 dark:text-indigo-400">
                    {value}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors"
            >
                Submit Assessment
            </button>
        </div>
    );
};

export default AttentionCheck;
