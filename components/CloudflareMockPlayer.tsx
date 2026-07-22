'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type CloudflareMockPlayerProps = {
  manifestUrl: string;
  poster?: string;
  autoPlay?: boolean;
};

export function CloudflareMockPlayer({
  manifestUrl,
  poster,
  autoPlay = true,
}: CloudflareMockPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
      if (autoPlay) {
        video.play().catch(() => {
          // Ignore autoplay rejection on browsers that require interaction
        });
      }
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // Ignore autoplay rejection on browsers that require interaction
          });
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [manifestUrl, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      muted={autoPlay}
      poster={poster}
      className="w-full h-full"
    />
  );
}
