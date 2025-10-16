"use client";

import { useState } from "react";
import AudioUploader from "./components/AudioUploader";
import AudioPlayer from "./components/AudioPlayer";
import AnalysisResults from "./components/AnalysisResults";

interface AnalysisResult {
  scores: Record<string, number>;
  overallFeedback: string;
  observation: string;
}

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!audioFile) {
      setError("Please select an audio file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await fetch("/api/analyze-call", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Call Recording Analysis
        </h1>
        
        <div className="space-y-6">
          {/* Audio Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Audio File</h2>
            <AudioUploader onFileSelect={handleFileSelect} />
          </div>

          {/* Audio Player Section */}
          {audioUrl && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Audio Playback</h2>
              <AudioPlayer audioUrl={audioUrl} />
            </div>
          )}

          {/* Process Button */}
          {audioFile && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Process"}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <AnalysisResults result={analysisResult} />
          )}
        </div>
      </div>
    </div>
  );
}
