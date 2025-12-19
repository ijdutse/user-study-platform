import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
    src: string;
    onError?: () => void;
    onEnded?: () => void;
}

const Player = ReactPlayer as any;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onError = () => { }, onEnded }) => {
    const [isBuffering, setIsBuffering] = React.useState(true);

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-xl aspect-video relative">
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}
            <div className="w-full h-full">
                <Player
                    url={src}
                    controls
                    width="100%"
                    height="100%"
                    onBuffer={() => setIsBuffering(true)}
                    onBufferEnd={() => setIsBuffering(false)}
                    onReady={() => setIsBuffering(false)}
                    onStart={() => setIsBuffering(false)}
                    onEnded={onEnded}
                    onError={(e: any) => {
                        console.error('VideoPlayer Error:', e);
                        setIsBuffering(false);
                        onError();
                    }}
                />
            </div>
        </div>
    );
};

export default VideoPlayer;
