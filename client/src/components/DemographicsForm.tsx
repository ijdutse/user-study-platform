import React, { useState } from 'react';

interface DemographicsFormProps {
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
}

const DemographicsForm: React.FC<DemographicsFormProps> = ({ onSubmit, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        ethnicity: '',
        education: '',
        language_fluency: '',
        media_familiarity: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (Object.values(formData).some(val => val === '')) {
            alert('Please fill in all fields');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Participant Information</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300 text-sm text-center">
                Please provide some basic information about yourself before we begin.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your age"
                        min="18"
                        max="100"
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        disabled={isSubmitting}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ethnicity</label>
                    <select
                        name="ethnicity"
                        value={formData.ethnicity}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        disabled={isSubmitting}
                    >
                        <option value="">Select Ethnicity</option>
                        <option value="Asian">Asian</option>
                        <option value="Black/African American">Black/African American</option>
                        <option value="Hispanic/Latino">Hispanic/Latino</option>
                        <option value="White/Caucasian">White/Caucasian</option>
                        <option value="Native American">Native American</option>
                        <option value="Pacific Islander">Pacific Islander</option>
                        <option value="Mixed">Mixed</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education Level</label>
                    <select
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        disabled={isSubmitting}
                    >
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Associate Degree">Associate Degree</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate">Doctorate</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language Fluency</label>
                    <select
                        name="language_fluency"
                        value={formData.language_fluency}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        disabled={isSubmitting}
                    >
                        <option value="">Select Fluency</option>
                        <option value="Native">Native Speaker</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Beginner">Beginner</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familiarity with AI Generated Media</label>
                    <select
                        name="media_familiarity"
                        value={formData.media_familiarity}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        disabled={isSubmitting}
                    >
                        <option value="">Select Familiarity</option>
                        <option value="Very Familiar">Very Familiar (I use/see it often)</option>
                        <option value="Somewhat Familiar">Somewhat Familiar (I've heard of it)</option>
                        <option value="Not Familiar">Not Familiar (New to me)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-bold py-3 px-4 rounded-lg shadow transition-colors mt-6 ${isSubmitting
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
                            Starting...
                        </span>
                    ) : 'Start Assessment'}
                </button>
            </form>
        </div>
    );
};

export default DemographicsForm;
