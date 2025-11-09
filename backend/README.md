# Toyota Smart Compass - Car Advisor

A React + TailwindCSS application that provides AI-powered Toyota car recommendations based on user specifications.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Make sure you have your `.env` file with your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

## Usage

### Step 1: Generate Recommendations

Run the advisor script to analyze your preferences and generate recommendations:

```bash
npm run advisor
```

This will:

- Prompt you for your vehicle specifications
- Use AI to analyze and rank Toyota vehicles
- Generate a `public/recommendations.json` file

### Step 2: View Results

Start the React development server:

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

## Features

- **AI-Powered Analysis**: Uses Google Gemini to understand your needs and recommend vehicles
- **Smart Compass UI**: Clean, modern interface inspired by Smart Compass design
- **Compare Mode**: Select any 2 vehicles to compare side-by-side
- **Factor-Based Comparison**: Intelligent color-coded comparison of:
  - Horsepower
  - MPG
  - Leg Room
  - Price/Lease
  - And more!
- **Responsive Design**: Works beautifully on desktop and mobile
- **Smooth Animations**: Built with Framer Motion for fluid interactions

## Project Structure

```
├── src/
│   ├── App.tsx                    # Main app component
│   ├── CarRecommendations.tsx     # Car grid and comparison UI
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind styles
├── public/
│   └── recommendations.json       # Generated recommendations
├── chat-car-advisor-wrapper.js    # Node.js advisor script
├── cars_with_links_annotated.json # Toyota vehicle database
└── package.json
```

## How It Works

1. The Node.js script (`chat-car-advisor-wrapper.js`) uses the Gemini API to:

   - Understand your vehicle requirements
   - Analyze the Toyota vehicle database
   - Extract relevant factors you care about
   - Rank vehicles by best match

2. The React app loads the generated JSON and displays:
   - AI analysis explanation
   - Vehicle cards with requested factors
   - Interactive comparison tool

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Vite** - Build tool
- **Google Gemini AI** - Recommendation engine
