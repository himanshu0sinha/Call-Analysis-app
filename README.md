# Call Recording Analysis App

A Next.js web application for analyzing call recordings with AI-powered transcription and quality evaluation.

## Features

### Frontend
- **Audio Upload**: Drag & drop or click to upload MP3/WAV files
- **Audio Player**: Built-in audio player with play/pause controls
- **Process Button**: Trigger AI analysis of uploaded recordings
- **Results Display**: 
  - Scores for all evaluation parameters
  - Overall feedback text
  - Detailed observations

### API
- **Audio Transcription**: Uses Groq Whisper Large v3 for speech-to-text
- **AI Analysis**: Llama 3.1 70B powered evaluation based on call center metrics
- **Structured Output**: JSON format with scores and detailed feedback

### Evaluation Parameters
- **greeting** (Pass/Fail, 5 points): Proper call opening
- **collectionUrgency** (0-15 points): Payment urgency communication
- **empathy** (0-12 points): Agent empathy toward customer
- **clarity** (0-10 points): Communication clarity
- **professionalism** (0-10 points): Professional demeanor
- **problemSolving** (0-12 points): Issue resolution approach
- **disclaimer** (Pass/Fail, 5 points): Legal disclaimer provision
- **closingStatement** (0-8 points): Call closing effectiveness

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Groq API key (get one from [Groq Console](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd call-analysis-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Audio**: Drag and drop an MP3 or WAV file, or click to browse
2. **Preview**: Use the built-in audio player to listen to the recording
3. **Process**: Click the "Process" button to start AI analysis
4. **Review Results**: View scores, feedback, and observations

## API Endpoint

### POST /api/analyze-call

**Request**: Multipart form data with audio file

**Response**:
```json
{
  "scores": {
    "greeting": 5,
    "collectionUrgency": 12,
    "empathy": 8,
    "clarity": 9,
    "professionalism": 10,
    "problemSolving": 10,
    "disclaimer": 0,
    "closingStatement": 6
  },
  "overallFeedback": "The agent demonstrated strong professionalism and problem-solving skills...",
  "observation": "Customer raised objections about penalty fees. Agent handled well but missed required disclosures."
}
```

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **File Upload**: React Dropzone, Formidable
- **AI Services**: Groq (Whisper Large v3 + Llama 3.1 70B)
- **Audio Processing**: HTML5 Audio API

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for Whisper and Llama models | Yes |
| `NEXTAUTH_URL` | Application URL (for future auth features) | No |
| `NEXTAUTH_SECRET` | Secret for session encryption | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
