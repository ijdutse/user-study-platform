import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DemographicsForm from './components/DemographicsForm';
import AdminDashboard from './pages/AdminDashboard';
import ConsentPage from './components/ConsentPage';
import TutorialPage from './components/TutorialPage';
import DebriefPage from './components/DebriefPage';
import ThankYouPage from './components/ThankYouPage';
import AssessmentPage from './pages/AssessmentPage';
import { fetchVideos, submitRating, submitDemographics, submitAttentionCheck, submitDebrief } from './api';
import type { Video, Rating } from './types';

function AssessmentApp() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(() => {
    const saved = localStorage.getItem('assessment_step');
    return saved ? parseInt(saved) as any : 1;
  });
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('assessment_currentIndex');
    return saved ? parseInt(saved) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantId] = useState(() => {
    const saved = localStorage.getItem('assessment_participantId');
    return saved || 'user_' + Math.random().toString(36).substr(2, 9);
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('assessment_darkMode') === 'true';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVideos();
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('assessment_step', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('assessment_currentIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('assessment_participantId', participantId);
  }, [participantId]);

  useEffect(() => {
    localStorage.setItem('assessment_darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Clear progress on completion
  useEffect(() => {
    if (step === 6) {
      localStorage.removeItem('assessment_step');
      localStorage.removeItem('assessment_currentIndex');
      localStorage.removeItem('assessment_participantId');
    }
  }, [step]);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVideos();
      console.log('Loaded videos:', data);
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      localStorage.removeItem('assessment_step');
      localStorage.removeItem('assessment_currentIndex');
      localStorage.removeItem('assessment_participantId');
      window.location.reload();
    }
  };

  const handleConsent = (email: string) => {
    sessionStorage.setItem('participantEmail', email);
    setStep(2);
  };

  const handleDemographicsSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const email = sessionStorage.getItem('participantEmail') || '';
      await submitDemographics({
        id: participantId,
        ...data,
        contact_email: email,
        consent: true
      });
      setStep(3);
    } catch (error) {
      console.error('Error submitting demographics:', error);
      alert('Failed to save information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTutorialComplete = async (score: number) => {
    try {
      await submitAttentionCheck(participantId, score);
      setStep(4);
    } catch (error) {
      console.error('Error submitting attention check:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const handleRatingSubmit = async (ratingData: Omit<Rating, 'participant_id'>) => {
    setIsSubmitting(true);
    try {
      await submitRating({
        ...ratingData,
        participant_id: participantId
      });

      if (currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        setStep(5);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDebriefSubmit = async (feedback: string, compensationId: string) => {
    try {
      await submitDebrief(participantId, feedback, compensationId);
      setStep(6);
    } catch (error) {
      console.error('Error submitting debrief:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 text-center">
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={loadVideos}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const DarkModeToggle = () => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-md"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <DarkModeToggle />

      <div className="flex-grow">
        {step === 1 && <ConsentPage onConsent={handleConsent} />}

        {step === 2 && (
          <div className="py-8 px-4">
            <DemographicsForm onSubmit={handleDemographicsSubmit} isSubmitting={isSubmitting} />
          </div>
        )}

        {step === 3 && <TutorialPage onComplete={handleTutorialComplete} />}

        {step === 4 && (
          <AssessmentPage
            videos={videos}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onRatingSubmit={handleRatingSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 5 && (
          <DebriefPage
            onSubmit={handleDebriefSubmit}
            onBack={() => {
              setStep(4);
              setCurrentIndex(videos.length - 1);
            }}
          />
        )}

        {step === 6 && <ThankYouPage />}
      </div>

      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <button
          onClick={handleReset}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-300 underline"
        >
          Reset Progress
        </button>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AssessmentApp />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
