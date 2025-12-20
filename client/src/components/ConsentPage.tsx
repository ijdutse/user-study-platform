import React, { useState } from 'react';

interface ConsentPageProps {
    onConsent: (email: string) => void;
}

const ConsentPage: React.FC<ConsentPageProps> = ({ onConsent }) => {
    const [consented, setConsented] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (consented) {
            onConsent(email);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Research Study Consent</h1>

                <div className="prose dark:prose-invert mb-8 text-gray-600 dark:text-gray-300">
                    <p className="mb-4">
                        You are invited to participate in a research study about AI-generated media.
                        The purpose of this study is to understand how people perceive and evaluate generated videos.
                    </p>
                    <h3 className="text-lg font-semibold mb-2">Procedures</h3>
                    <div className="mb-4">
                        If you agree to participate, you will be asked to:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Complete a short demographic survey.</li>
                            <li>Watch a tutorial video.</li>
                            <li>View and rate a series of short videos.</li>
                            <li>Provide optional feedback at the end.</li>
                        </ul>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Data Usage</h3>
                    <p className="mb-4">
                        Your responses will be used for research purposes only. Data will be stored securely and
                        analyzed in aggregate. No personally identifiable information will be shared publicly.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <input
                            type="checkbox"
                            id="consent"
                            checked={consented}
                            onChange={(e) => setConsented(e.target.checked)}
                            className="mt-1 h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="consent" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            I have read the information above and agree to participate in this study.
                            I understand that my participation is voluntary and I can withdraw at any time.
                        </label>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address (Optional - for debriefing/follow-up only)
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!consented}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${consented
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Continue to Study
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConsentPage;
