import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture2 } from 'lucide-react';

interface VideoPlayerProps {
  // Support both `videoUrl` and `url` to match existing usages
  videoUrl?: string;
  url?: string;
  title?: string;
  posterUrl?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ videoUrl, url, title, posterUrl, onProgress, onComplete }: VideoPlayerProps) {
  const sourceUrl = videoUrl || url || '';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        onProgress(video.currentTime, video.duration);
      }

      // Check if video is near end (within 2 seconds)
      if (video.duration - video.currentTime < 2 && onComplete) {
        onComplete();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(null);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleError = () => {
      setHasError('Unable to play this video. Please try again.');
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const togglePiP = async () => {
    const el = videoRef.current as any;
    if (!el) return;
    try {
      if (document.pictureInPictureElement) {
        // @ts-ignore
        await document.exitPictureInPicture();
      } else if (el.requestPictureInPicture) {
        await el.requestPictureInPicture();
      }
    } catch {}
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if it's a Vimeo URL
  const isVimeoUrl = sourceUrl.includes('vimeo.com');
  const vimeoId = isVimeoUrl ? sourceUrl.split('/').pop() : null;

  // Check if it's a YouTube URL and extract ID (robust)
  const isYouTubeUrl = sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be');
  const getYouTubeId = (u: string): string | null => {
    try {
      const urlObj = new URL(u);
      const host = urlObj.hostname.replace('www.', '');

      // watch?v=ID
      const v = urlObj.searchParams.get('v');
      if (v) return v;

      // youtu.be/ID
      if (host === 'youtu.be') {
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts[0]) return parts[0];
      }

      // youtube.com/embed/ID
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const embedIdx = pathParts.indexOf('embed');
      if (embedIdx >= 0 && pathParts[embedIdx + 1]) return pathParts[embedIdx + 1];

      // youtube.com/shorts/ID
      const shortsIdx = pathParts.indexOf('shorts');
      if (shortsIdx >= 0 && pathParts[shortsIdx + 1]) return pathParts[shortsIdx + 1];

      // Fallback regex from raw string
      const match = u.match(/[?&]v=([^&]+)/) || u.match(/youtu\.be\/([^?&#]+)/);
      if (match && match[1]) return match[1];
      return null;
    } catch {
      const match = u.match(/[?&]v=([^&]+)/) || u.match(/youtu\.be\/([^?&#]+)/);
      return match ? match[1] : null;
    }
  };
  const youtubeId = isYouTubeUrl ? getYouTubeId(sourceUrl) : null;

  if (isVimeoUrl && vimeoId) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isYouTubeUrl && youtubeId) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          title={title || 'YouTube video player'}
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  // Prevent ORB by never attempting to play YouTube watch URLs via <video>
  if (isYouTubeUrl && !youtubeId) {
    return (
      <div className="w-full bg-black rounded-lg p-4 text-white">
        <p className="text-sm">
          Invalid YouTube URL format for direct playback. Please provide a standard YouTube link
          (watch, youtu.be, shorts, or embed); we will embed it safely.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full bg-black rounded-lg overflow-hidden group aspect-video shadow-md"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ') { e.preventDefault(); togglePlay(); }
        if (e.key.toLowerCase() === 'm') toggleMute();
        if (e.key.toLowerCase() === 'f') toggleFullscreen();
        if (e.key === 'ArrowRight' && videoRef.current) {
          const t = Math.min(duration, videoRef.current.currentTime + 5);
          videoRef.current.currentTime = t;
          setCurrentTime(t);
        }
        if (e.key === 'ArrowLeft' && videoRef.current) {
          const t = Math.max(0, videoRef.current.currentTime - 5);
          videoRef.current.currentTime = t;
          setCurrentTime(t);
        }
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        src={sourceUrl}
        onClick={togglePlay}
        poster={posterUrl}
        preload="metadata"
        playsInline
        controls={false}
      />

      {/* Title overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent text-white text-sm">
          <div className="flex items-center justify-between">
            <span className="line-clamp-1">{title}</span>
            {isLoading && (
              <span className="text-white/70 text-xs">Loading…</span>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 text-white px-4 py-3 rounded">
            {hasError}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mb-3 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 100%)`
          }}
        />

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>

            {/* Volume */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolume}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed */}
            <select
              value={playbackRate}
              onChange={(e) => {
                const r = parseFloat(e.target.value);
                setPlaybackRate(r);
                if (videoRef.current) videoRef.current.playbackRate = r;
              }}
              className="bg-black/40 text-white text-sm rounded px-2 py-1"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            <button
              onClick={togglePiP}
              className="text-white hover:text-blue-400 transition-colors"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="h-6 w-6" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-6 transition-colors"
        >
          <Play className="h-12 w-12" />
        </button>
      )}
    </div>
  );
}
