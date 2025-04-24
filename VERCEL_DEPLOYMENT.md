# Vercel Deployment Guide for MindBoard

This guide provides step-by-step instructions for deploying MindBoard to Vercel. MindBoard is an AI creativity battle platform that uses a free tier of Perplexity AI for creativity evaluation.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)
3. A PostgreSQL database (we recommend Neon.tech for their free tier)
4. (Optional) A Perplexity API key (free tier available)

## Deployment Steps

### 1. Prepare Your Project for Deployment

Your project is already configured for Vercel deployment with the `vercel.json` file. The offline mode is enabled by default so you don't need a Perplexity API key to run the application.

### 2. Push Your Code to GitHub

1. Create a new repository on GitHub
2. Initialize Git in your project if it's not already initialized:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Add your GitHub repository as remote and push:
   ```bash
   git remote add origin https://github.com/yourusername/mindboard.git
   git push -u origin main
   ```

### 3. Set Up a PostgreSQL Database

#### Using Neon.tech (Recommended)

1. Sign up at https://neon.tech
2. Create a new project
3. Create a new database within that project
4. Get the connection string (it will look like `postgresql://username:password@hostname:port/database`)

#### Using Any Other PostgreSQL Provider

1. Set up a PostgreSQL database with your preferred provider
2. Get the connection string

### 4. Deploy to Vercel

1. Log in to your Vercel account
2. Click "Add New..." and select "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Choose "Other"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Add the following Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `FORCE_OFFLINE_MODE`: Set to "true" if you don't have a Perplexity API key
   - `PERPLEXITY_API_KEY`: (Optional) Your Perplexity API key if you have one

6. Click "Deploy"

### 5. Wait for Deployment to Complete

Vercel will build and deploy your application. This process usually takes a few minutes.

### 6. Access Your Deployed Application

Once the deployment is complete, you can access your application at the URL provided by Vercel (typically `https://your-project-name.vercel.app`).

## Troubleshooting

### Database Connection Issues

- Make sure your `DATABASE_URL` environment variable is correctly set in Vercel
- Verify that your database is publicly accessible or configure Vercel IP allow-listing

### API Key Issues

- If you're using the Perplexity API, make sure your API key is correctly set in Vercel
- If you don't have a Perplexity API key, ensure `FORCE_OFFLINE_MODE` is set to "true"

### Build Failures

- Check the build logs in Vercel for specific error messages
- Make sure all dependencies are correctly listed in your `package.json`

## Using Your Own Perplexity API Key (Optional)

If you want to enable real AI creative prompts and evaluations:

1. Sign up for a Perplexity account at [perplexity.ai](https://www.perplexity.ai/)
2. Navigate to your account settings or developer console
3. Create a new API key
4. Add the key to your Vercel environment variables as `PERPLEXITY_API_KEY`
5. Set `FORCE_OFFLINE_MODE` to "false"

## Important Notes

- The application is configured to run in offline mode if no API key is provided
- In offline mode, the app uses predefined creative prompts and generic AI responses
- For the best experience, use your own Perplexity API key

## Custom Domain Setup (Optional)

1. In your Vercel project, go to "Settings" > "Domains"
2. Add your custom domain and follow the verification steps
3. Update your DNS settings according to Vercel's instructions

Congratulations! Your MindBoard application should now be successfully deployed to Vercel.