"use client";

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  useTrackTranscription,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

interface LiveKitPageProps {}

const Page: React.FC<LiveKitPageProps> = () => {
  const room = "quickstart-room";
  const name = "quickstart-user";
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const getToken = async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    };

    getToken();
  }, [room, name]);

  const startRecording = async () => {
    try {
      const response = await fetch("/api/startRecording", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        console.log("Recording started with egressId:", data.egressId);
      } else {
        console.error("Failed to start recording:", data.error);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const addHeygenAsParticipant = async () => {
    try {
      const response = await fetch("/api/create-ingress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Heygen Ingress",
          roomName: room,
          participantIdentity: "heygen-participant",
          participantName: "Heygen Avatar",
          url: " " //url here
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Ingress created successfully:", data.ingressInfo);
      } else {
        console.error("Failed to create ingress:", data.error);
      }
    } catch (error) {
      console.error("Error creating ingress:", error);
    }
  };

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <MyVideoConference />
      <RoomAudioRenderer />
      <ControlBar />
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={addHeygenAsParticipant}>
        Add Heygen as Participant
      </button>
    </LiveKitRoom>
  );
};

const MyVideoConference: React.FC = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: true }, // Ensure the microphone is included
    ],
    { onlySubscribed: false }
  );

  const [transcript, setTranscript] = useState<string>("");

  // Find the microphone track and the participant who published it
  const audioTrack = tracks.find(
    (track) => track.source === Track.Source.Microphone
  );
  console.log("Audio Track:", audioTrack);

  if (audioTrack?.publication?.isSubscribed && audioTrack.publication.track) {
    console.log("Microphone is active and publishing audio.");
  } else {
    console.log("Microphone is not active or not publishing audio.");
  }

  // Define a valid placeholder object for the track reference when audioTrack is unavailable
  const placeholderTrackRef = {
    participant: { identity: "placeholder", sid: "placeholder" } as any, // Minimal placeholder participant object
    publication: undefined, // No publication
    source: Track.Source.Microphone,
  };

  // Set the track reference or use the placeholder
  const trackRef =
    audioTrack && audioTrack.participant && audioTrack.publication
      ? {
          participant: audioTrack.participant,
          publication: audioTrack.publication,
          source: Track.Source.Microphone,
        }
      : placeholderTrackRef;

  // Call the hook with the track reference or the placeholder
  const transcription = useTrackTranscription(trackRef, {
    bufferSize: 100, // Optional: adjust buffer size or other options
  });

  useEffect(() => {
    if (transcription?.segments) {
      const latestTranscript = transcription.segments
        .map((segment) => segment.text)
        .join(" ");
      setTranscript(latestTranscript);
    }
  }, [transcription?.segments]);

  return (
    <div className="flex" style={{ height: "60%", width: "100%" }}>
      {/* Left side - your video */}
      <div style={{ flex: 1, padding: "10px" }}>
        <GridLayout
          tracks={tracks.filter(
            (track) => track.source === Track.Source.Camera
          )} // Only show camera tracks
          className="overflow-scroll"
          style={{ height: "100%" }}
        >
          <ParticipantTile />
          {/* <div style={{ flex: 1, padding: "10px" }}>
              <Heygen />
            </div> */}
          {/* </ParticipantTile> */}
        </GridLayout>
      </div>

      {/* Right side - Heygen */}
    </div>
  );
};

export default Page;
