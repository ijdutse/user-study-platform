import { useState, useEffect } from 'react';
import { loginAdmin, fetchVideos, uploadVideo, updateVideo, fetchAdminStats, exportRatings, exportParticipants, fetchRawParticipants, fetchRawRatings } from '../api';
import type { Video } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminStats {
    ageDistribution: { age_group: string; count: string }[];
    videoRatings: {
        title: string;
        avg_accuracy: string;
        avg_bias: string;
        avg_representativeness: string;
        avg_stereotypes: string;
        rating_count: string;
    }[];
}

export default function AdminDashboard() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'videos' | 'analytics' | 'data'>('videos');

    // Data State
    const [videos, setVideos] = useState<Video[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [ratings, setRatings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadContext, setUploadContext] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Edit State
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [videosData, statsData] = await Promise.all([
                fetchVideos(),
                fetchAdminStats(token!)
            ]);
            setVideos(videosData);
            setStats(statsData);

            if (activeTab === 'data') {
                const [participantsData, ratingsData] = await Promise.all([
                    fetchRawParticipants(token!),
                    fetchRawRatings(token!)
                ]);
                setParticipants(participantsData);
                setRatings(ratingsData);
            }
        } catch (err) {
            console.error("Failed to load data", err);
            if (err instanceof Error && err.message.includes('403')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await loginAdmin(password);
            localStorage.setItem('admin_token', data.accessToken);
            setToken(data.accessToken);
            setError('');
        } catch (err) {
            setError('Invalid password');
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsUploading(true);
        try {
            await uploadVideo(uploadFile, uploadTitle, uploadContext, token, uploadUrl);
            setUploadFile(null);
            setUploadUrl('');
            setUploadTitle('');
            setUploadContext('');
            alert('Video added successfully!');
            loadData();
        } catch (err) {
            console.error('Upload error:', err);
            alert(`Failed to add video: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVideo || !token) return;

        try {
            await updateVideo(editingVideo.id, editingVideo.title, editingVideo.context, token, editingVideo.url);
            setEditingVideo(null);
            loadData();
            alert('Video updated successfully!');
        } catch (err) {
            console.error('Update error:', err);
            alert(`Failed to update video: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const handleExportRatings = async () => {
        try {
            await exportRatings(token!);
        } catch (err) {
            alert('Failed to export ratings');
        }
    };

    const handleExportParticipants = async () => {
        try {
            await exportParticipants(token!);
        } catch (err) {
            alert('Failed to export participants');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Login</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                            <div className="ml-10 flex items-baseline space-x-4">
                                <button
                                    onClick={() => setActiveTab('videos')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'videos'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    Videos
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'analytics'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    Analytics
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'data'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    Raw Data
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleExportRatings}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Export Ratings
                            </button>
                            <button
                                onClick={handleExportParticipants}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Export Participants
                            </button>
                            <button
                                onClick={logout}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : activeTab === 'videos' ? (
                    <div className="space-y-6">
                        {/* Upload Section */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload New Video</h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video File (Optional if URL provided)</label>
                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm"
                                            onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube URL (Optional if File provided)</label>
                                        <input
                                            type="text"
                                            value={uploadUrl}
                                            onChange={(e) => setUploadUrl(e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Context / Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={uploadContext}
                                        onChange={(e) => setUploadContext(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUploading || (!uploadFile && !uploadUrl)}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {isUploading ? 'Adding...' : 'Add Video'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Video List */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Existing Videos</h3>
                            </div>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {videos.map((video) => (
                                    <li key={video.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{video.title}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {video.url ? `URL: ${video.url}` : `File: ${video.filename}`}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{video.context}</p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <button
                                                    onClick={() => setEditingVideo(video)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : activeTab === 'analytics' ? (
                    <div className="space-y-6">
                        {stats && (
                            <>
                                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Participant Demographics (Age)</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.ageDistribution}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="age_group" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#4F46E5" name="Participants" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Average Ratings per Video</h3>
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.videoRatings} layout="vertical" margin={{ left: 50 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" domain={[0, 100]} />
                                                <YAxis dataKey="title" type="category" width={150} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="avg_accuracy" fill="#10B981" name="Accuracy" />
                                                <Bar dataKey="avg_bias" fill="#EF4444" name="Bias" />
                                                <Bar dataKey="avg_representativeness" fill="#F59E0B" name="Representativeness" />
                                                <Bar dataKey="avg_stereotypes" fill="#6366F1" name="Stereotypes" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Participants Raw Data</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Consent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {participants.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{p.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.age}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.gender}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.consent ? 'Yes' : 'No'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.contact_email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(p.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Ratings Raw Data</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Video</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Participant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accuracy</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bias</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comments</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {ratings.map((r) => (
                                            <tr key={r.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.video_title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{r.participant_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{r.accuracy}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{r.bias}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{r.comments}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(r.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {editingVideo && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleUpdate}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Edit Video</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingVideo.title}
                                                onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube URL</label>
                                            <input
                                                type="text"
                                                value={editingVideo.url || ''}
                                                onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Context</label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={editingVideo.context}
                                                onChange={(e) => setEditingVideo({ ...editingVideo, context: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingVideo(null)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
