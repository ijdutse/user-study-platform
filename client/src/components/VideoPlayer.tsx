import React from 'react';

interface VideoPlayerProps {
    src: string;
    onError: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onError }) => {
    const [isBuffering, setIsBuffering] = React.useState(true);

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-xl aspect-w-16 aspect-h-9 relative">
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}
            <video
                className="w-full h-full object-contain"
                controls
                src={src}
                onError={onError}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                onLoadStart={() => setIsBuffering(true)}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
