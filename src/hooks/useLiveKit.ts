import { useEffect, useRef, useState } from 'react'
import { api } from '@/api/endpoints'
import { ApiError } from '@/api/client'
import type {
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
} from 'livekit-client'

export type LiveKitStatus =
  | 'idle'
  | 'fetching-token'
  | 'connecting'
  | 'connected'
  | 'lesson-not-started'
  | 'permission-denied'
  | 'unavailable'
  | 'error'

export interface UseLiveKitResult {
  status: LiveKitStatus
  errorMessage: string | null
  room: Room | null
  remoteParticipant: RemoteParticipant | null
  localVideoTrack: LocalVideoTrack | null
  remoteVideoTrack: RemoteTrack | null
  micEnabled: boolean
  cameraEnabled: boolean
  setMic: (enabled: boolean) => Promise<void>
  setCamera: (enabled: boolean) => Promise<void>
  disconnect: () => Promise<void>
}

function isMockUrl(url: string): boolean {
  return !url || url.startsWith('mock://') || url.includes('mock')
}

export function useLiveKit(lessonId: string | undefined): UseLiveKitResult {
  const [status, setStatus] = useState<LiveKitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [remoteParticipant, setRemoteParticipant] = useState<RemoteParticipant | null>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null)
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<RemoteTrack | null>(null)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const roomRef = useRef<Room | null>(null)

  useEffect(() => {
    if (!lessonId) return
    let cancelled = false

    async function bootstrap() {
      setStatus('fetching-token')
      setErrorMessage(null)
      let access
      try {
        access = await api.videoToken(lessonId!)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 400) {
          setStatus('lesson-not-started')
          return
        }
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Token request failed')
        return
      }
      if (cancelled) return

      if (isMockUrl(access.url)) {
        setStatus('unavailable')
        setErrorMessage(
          'Mock backend in use. Real LiveKit room not reachable from preview.',
        )
        return
      }

      const lk = await import('livekit-client')
      if (cancelled) return

      const room = new lk.Room({ adaptiveStream: true, dynacast: true })
      roomRef.current = room

      room.on(lk.RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, p: RemoteParticipant) => {
        if (track.kind === lk.Track.Kind.Video) {
          setRemoteVideoTrack(track)
          setRemoteParticipant(p)
        }
      })
      room.on(lk.RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === lk.Track.Kind.Video) {
          setRemoteVideoTrack(null)
        }
      })
      room.on(lk.RoomEvent.ParticipantDisconnected, () => {
        setRemoteVideoTrack(null)
        setRemoteParticipant(null)
      })
      room.on(lk.RoomEvent.Disconnected, () => {
        setStatus('idle')
      })

      try {
        setStatus('connecting')
        await room.connect(access.url, access.accessToken)
        if (cancelled) {
          await room.disconnect()
          return
        }
        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)
        const camPub = room.localParticipant.getTrackPublication(lk.Track.Source.Camera)
        const camTrack = camPub?.track
        if (camTrack && camTrack.kind === lk.Track.Kind.Video) {
          setLocalVideoTrack(camTrack as LocalVideoTrack)
        }
        // Pick up any participants that joined before us.
        for (const p of room.remoteParticipants.values()) {
          for (const pub of p.trackPublications.values()) {
            if (pub.track && pub.kind === lk.Track.Kind.Video) {
              setRemoteVideoTrack(pub.track)
              setRemoteParticipant(p)
              break
            }
          }
        }
        setStatus('connected')
      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message.toLowerCase() : ''
        if (msg.includes('permission') || msg.includes('notallowed')) {
          setStatus('permission-denied')
        } else {
          setStatus('error')
        }
        setErrorMessage(err instanceof Error ? err.message : 'Connection failed')
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      const room = roomRef.current
      if (room) {
        roomRef.current = null
        void room.disconnect()
      }
      setRemoteVideoTrack(null)
      setRemoteParticipant(null)
      setLocalVideoTrack(null)
    }
  }, [lessonId])

  async function setMic(enabled: boolean) {
    setMicEnabled(enabled)
    const room = roomRef.current
    if (!room) return
    try {
      await room.localParticipant.setMicrophoneEnabled(enabled)
    } catch {
      /* surface in error state separately if needed */
    }
  }

  async function setCamera(enabled: boolean) {
    setCameraEnabled(enabled)
    const room = roomRef.current
    if (!room) return
    try {
      await room.localParticipant.setCameraEnabled(enabled)
      const lk = await import('livekit-client')
      const pub = room.localParticipant.getTrackPublication(lk.Track.Source.Camera)
      const track = pub?.track
      if (track && track.kind === lk.Track.Kind.Video) {
        setLocalVideoTrack(track as LocalVideoTrack)
      } else if (!enabled) {
        setLocalVideoTrack(null)
      }
    } catch {
      /* swallow */
    }
  }

  async function disconnect() {
    const room = roomRef.current
    if (!room) return
    roomRef.current = null
    await room.disconnect()
  }

  // unused param suppression
  void Object.assign({}, { _: null as LocalAudioTrack | null })

  return {
    status,
    errorMessage,
    room: roomRef.current,
    remoteParticipant,
    localVideoTrack,
    remoteVideoTrack,
    micEnabled,
    cameraEnabled,
    setMic,
    setCamera,
    disconnect,
  }
}
