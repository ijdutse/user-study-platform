import React from 'react';

interface VideoPlayerProps {
    src: string;
    onError: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onError }) => {
    return (
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-xl aspect-w-16 aspect-h-9">
            <video
                className="w-full h-full object-contain"
                controls
                src={src}
                onError={onError}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
