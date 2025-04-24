# MindBoard: AI Creativity Battle Arena

MindBoard is an innovative AI-powered creativity platform that transforms creative challenges into engaging competitive experiences. Users can battle against AI in timed creative tasks, testing and expanding their imaginative capabilities.

## Features

- **Creative Challenges**: Get unique AI-generated prompts to spark your creativity
- **Timed Battles**: Test your creativity against the clock
- **Fair Judgment**: AI evaluates solutions based on originality, logic, and expression
- **Leaderboard**: Track your progress and compete for the top spot
- **Free AI Integration**: Uses Perplexity AI for prompt generation and evaluation

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Neon)
- **AI**: Perplexity API integration
- **Deployment**: Ready for Vercel

## Deployment Instructions for Vercel

Follow these steps to deploy MindBoard to Vercel:

### 1. Fork/Clone the Repository

First, make sure you have the code in your own GitHub repository.

### 2. Set Up a Vercel Account

If you don't already have a Vercel account, sign up at [vercel.com](https://vercel.com).

### 3. Create a New Project on Vercel

- From your Vercel dashboard, click "New Project"
- Import your GitHub repository
- Configure the project as follows:
  - **Framework**: Other
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

### 4. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string (from Neon or another provider)
- `PERPLEXITY_API_KEY`: Your Perplexity API key (Optional - get one from [perplexity.ai](https://www.perplexity.ai/))
- `FORCE_OFFLINE_MODE`: Set to "true" if you don't have a Perplexity API key (or "false" if you do)

### 5. Set Up PostgreSQL Database

#### Option 1: Neon (Recommended)

1. Sign up for a free account at [neon.tech](https://neon.tech)
2. Create a new PostgreSQL database
3. Get the connection string and add it as `DATABASE_URL` in Vercel

#### Option 2: Any PostgreSQL Provider

1. Set up a PostgreSQL database with your preferred provider
2. Get the connection string and add it as `DATABASE_URL` in Vercel

### 6. Deploy

- Click "Deploy" in Vercel
- Wait for the build to complete
- Your application will be live at the provided URL

### 7. Initialize the Database

The database schema will be automatically applied on first run.

## Running Locally for Development

1. Clone the repository
2. Copy `.env.example` to `.env` and set your environment variables
3. Run `npm install`
4. Run `npm run dev`
5. Open `http://localhost:5000` in your browser

## Getting a Perplexity API Key (Optional)

MindBoard can run in offline mode without a Perplexity API key, but if you want to use real AI-generated prompts and evaluations:

1. Sign up for a Perplexity account at [perplexity.ai](https://www.perplexity.ai/)
2. Navigate to your account settings or developer console
3. Create a new API key
4. Add the key to your environment variables as `PERPLEXITY_API_KEY`
5. Set `FORCE_OFFLINE_MODE` to "false"

## License

This project is licensed under the MIT License - see the LICENSE file for details.