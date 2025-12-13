import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ParticipantData {
    id: string;
    age: number;
    gender: string;
    ethnicity: string;
    education: string;
    language_fluency?: string;
    media_familiarity?: string;
    consent?: number;
    contact_email?: string;
    qualitative_feedback?: string;
    compensation_id?: string;
    attention_check?: number;
    timestamp: string;
}

interface RatingData {
    id: number;
    video_id: number;
    video_title: string;
    filename: string;
    participant_id: string;
    accuracy: number;
    bias: number;
    representativeness: number;
    stereotypes: number;
    comments: string;
    timestamp: string;
}

const AdminDashboard = () => {
    const [ratings, setRatings] = useState<RatingData[]>([]);
    const [participants, setParticipants] = useState<ParticipantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'demographics' | 'ratings'>('demographics');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.accessToken);
                setIsAuthenticated(true);
            } else {
                setError('Invalid password');
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please try again.');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setRatings([]);
        setParticipants([]);
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [ratingsRes, participantsRes] = await Promise.all([
                fetch('http://localhost:3001/api/ratings', { headers }),
                fetch('http://localhost:3001/api/participants', { headers })
            ]);

            if (ratingsRes.status === 401 || ratingsRes.status === 403 ||
                participantsRes.status === 401 || participantsRes.status === 403) {
                handleLogout();
                return;
            }

            const ratingsData = await ratingsRes.json();
            const participantsData = await participantsRes.json();

            setRatings(ratingsData.data);
            setParticipants(participantsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = (type: 'demographics' | 'ratings') => {
        const escapeCsv = (str: string | number | undefined) => {
            if (str === undefined || str === null) return '';
            const stringValue = String(str);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        let headers: string[] = [];
        let rows: string[] = [];
        let filename = '';

        if (type === 'demographics') {
            headers = ['Participant ID', 'Age', 'Gender', 'Ethnicity', 'Education', 'Fluency', 'Familiarity', 'Consent', 'Email', 'Attention Check', 'Feedback', 'Compensation ID', 'Timestamp'];
            rows = participants.map(p => [
                escapeCsv(p.id),
                escapeCsv(p.age),
                escapeCsv(p.gender),
                escapeCsv(p.ethnicity),
                escapeCsv(p.education),
                escapeCsv(p.language_fluency),
                escapeCsv(p.media_familiarity),
                p.consent ? 'Yes' : 'No',
                escapeCsv(p.contact_email),
                escapeCsv(p.attention_check),
                escapeCsv(p.qualitative_feedback),
                escapeCsv(p.compensation_id),
                p.timestamp
            ].join(','));
            filename = `demographics_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            headers = ['ID', 'Video Title', 'Filename', 'Participant ID', 'Accuracy', 'Bias', 'Representativeness', 'Stereotypes', 'Comments', 'Timestamp'];
            rows = ratings.map(r => [
                r.id,
                escapeCsv(r.video_title),
                escapeCsv(r.filename),
                escapeCsv(r.participant_id),
                r.accuracy,
                r.bias,
                r.representativeness,
                r.stereotypes,
                escapeCsv(r.comments),
                r.timestamp
            ].join(','));
            filename = `ratings_${new Date().toISOString().split('T')[0]}.csv`;
        }

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Admin Login</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="text-center mt-4">
                            <Link to="/" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                                Back to Assessment
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="p-8 text-center dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Assessment Results</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                            Logout
                        </button>
                        <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                            Back to Assessment
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'demographics' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('demographics')}
                    >
                        Demographics & Attention
                    </button>
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'ratings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('ratings')}
                    >
                        Video Ratings
                    </button>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => downloadCSV(activeTab)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
                    >
                        Export {activeTab === 'demographics' ? 'Demographics' : 'Ratings'} CSV
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        {activeTab === 'demographics' ? (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Demo</th>
                                        <th className="p-4">Background</th>
                                        <th className="p-4 text-center">Consent</th>
                                        <th className="p-4 text-center">Attn</th>
                                        <th className="p-4">Feedback & Comp</th>
                                        <th className="p-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {participants.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="p-4 font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                {p.id}
                                                {p.contact_email && <div className="text-gray-400 text-[10px]">{p.contact_email}</div>}
                                            </td>
                                            <td className="p-4 text-xs">
                                                <div>{p.age} / {p.gender}</div>
                                                <div className="text-gray-500">{p.ethnicity}</div>
                                                <div className="text-gray-500">{p.education}</div>
                                            </td>
                                            <td className="p-4 text-xs">
                                                <div>Fluency: {p.language_fluency || '-'}</div>
                                                <div>Fam: {p.media_familiarity || '-'}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {p.consent ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}
                                            </td>
                                            <td className={`p-4 text-center font-bold ${p.attention_check === 10 ? 'text-green-500' : 'text-red-500'}`}>
                                                {p.attention_check !== undefined ? p.attention_check : '-'}
                                            </td>
                                            <td className="p-4 text-xs max-w-xs">
                                                {p.qualitative_feedback && <div className="mb-1 italic">"{p.qualitative_feedback}"</div>}
                                                {p.compensation_id && <div className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded inline-block">{p.compensation_id}</div>}
                                            </td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(p.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">No participants yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold">
                                    <tr>
                                        <th className="p-4">Video</th>
                                        <th className="p-4">Participant ID</th>
                                        <th className="p-4 text-center">Acc</th>
                                        <th className="p-4 text-center">Bias</th>
                                        <th className="p-4 text-center">Rep</th>
                                        <th className="p-4 text-center">Stereo</th>
                                        <th className="p-4">Comments</th>
                                        <th className="p-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {ratings.map((rating) => (
                                        <tr key={rating.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="p-4 font-medium">{rating.video_title}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{rating.participant_id}</td>
                                            <td className="p-4 text-center">{rating.accuracy}</td>
                                            <td className="p-4 text-center">{rating.bias}</td>
                                            <td className="p-4 text-center">{rating.representativeness}</td>
                                            <td className="p-4 text-center">{rating.stereotypes}</td>
                                            <td className="p-4 max-w-xs truncate" title={rating.comments}>{rating.comments}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(rating.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {ratings.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-gray-500">No ratings submitted yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
