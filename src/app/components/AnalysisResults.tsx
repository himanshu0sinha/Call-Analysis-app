"use client";

interface AnalysisResult {
  scores: Record<string, number>;
  overallFeedback: string;
  observation: string;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const { scores, overallFeedback, observation } = result;

  const getScoreColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatParameterName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
      
      {/* Scores Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Evaluation Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(scores).map(([key, score]) => {
            // Determine max score based on parameter weights
            let maxScore = 15; // default for SCORE parameters
            if (key === 'greeting' || key === 'callDisclaimer' || key === 'callClosing' || key === 'fatalIdentification') {
              maxScore = 5;
            } else if (key === 'correctDisposition' || key === 'fatalTapeDiscloser') {
              maxScore = 10;
            } else if (key === 'fatalToneLanguage') {
              maxScore = 15;
            }
            return (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">
                    {formatParameterName(key)}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getScoreColor(score, maxScore)}`}>
                    {score}/{maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (score / maxScore) >= 0.8 ? 'bg-green-500' :
                      (score / maxScore) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Feedback Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Overall Feedback</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{overallFeedback}</p>
        </div>
      </div>

      {/* Observation Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Observation</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{observation}</p>
        </div>
      </div>
    </div>
  );
}