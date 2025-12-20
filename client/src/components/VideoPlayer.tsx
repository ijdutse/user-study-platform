import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
    src: string;
    onError?: () => void;
    onEnded?: () => void;
}

const Player = ReactPlayer as any;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onError = () => { }, onEnded }) => {
    const [delayedSrc, setDelayedSrc] = React.useState<string | null>(null);

    React.useEffect(() => {
        console.log('VideoPlayer: loading', src);
        const timer = setTimeout(() => {
            setDelayedSrc(src);
        }, 300);
        return () => clearTimeout(timer);
    }, [src]);

    return (
        <div className="w-full aspect-video bg-black relative overflow-hidden rounded-lg shadow-lg">
            {delayedSrc ? (
                <Player
                    url={delayedSrc}
                    controls
                    width="100%"
                    height="100%"
                    onStart={() => console.log('VideoPlayer: Started')}
                    onEnded={onEnded}
                    onError={(e: any) => {
                        console.error('VideoPlayer Error:', e);
                        onError();
                    }}
                    config={{
                        youtube: {
                            playerVars: {
                                autoplay: 0,
                                modestbranding: 1,
                                rel: 0
                            }
                        }
                    }}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
