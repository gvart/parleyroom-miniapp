import { useEffect, useRef } from 'react'
import type { LocalVideoTrack, RemoteTrack } from 'livekit-client'

interface VideoTileProps {
  track: LocalVideoTrack | RemoteTrack
  mirror?: boolean
  style?: React.CSSProperties
}

export function VideoTile({ track, mirror = false, style }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    track.attach(el)
    return () => {
      track.detach(el)
    }
  }, [track])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={mirror}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: mirror ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    />
  )
}
