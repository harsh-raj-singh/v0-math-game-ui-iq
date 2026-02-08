"use client";

import { useState, useRef, useCallback } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Prefer webm/opus, fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all tracks immediately
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const chunks = chunksRef.current;
        if (chunks.length === 0) {
          setIsListening(false);
          return;
        }

        const audioBlob = new Blob(chunks, { type: mimeType });

        // Skip very short recordings (likely accidental taps)
        if (audioBlob.size < 1000) {
          setIsListening(false);
          return;
        }

        setIsTranscribing(true);

        try {
          const formData = new FormData();
          const extension = mimeType.includes("webm") ? "webm" : "mp4";
          formData.append(
            "file",
            audioBlob,
            `recording.${extension}`
          );

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const text = (data.text || "").trim();
            if (text) {
              setTranscript(text);
            }
          } else {
            console.warn("Transcription request failed:", response.status);
          }
        } catch (err) {
          console.warn("Transcription error:", err);
        } finally {
          setIsTranscribing(false);
          setIsListening(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100); // collect data every 100ms
      setIsListening(true);
    } catch (err) {
      console.warn("Microphone access error:", err);
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    // If stream still exists, clean up
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript: isTranscribing ? "Transcribing..." : "",
    isSupported,
    isTranscribing,
    startListening,
    stopListening,
    clearTranscript,
  };
}
