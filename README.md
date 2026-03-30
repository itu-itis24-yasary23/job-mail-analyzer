# Job Mail Analyzer

A beautifully designed, Next.js-powered web application that elegantly parses your `.mbox` email exports to automatically organize and track your job application statuses, interviews, offers, and deadlines.

## Features Let The Data Work For You

- Parses emails using deterministic regex and keywords 
- Beautiful dark/light mode adaptable glassmorphic dashboard
- Highlights application deadlines ("son tarih", "deadline", "until")
- Connects standard events across diverse Turkish and English phrasing (Interviews, Rejected, Offers, Applications).

## How to Set Up & Run Locally

To get the application running on your own machine locally, follow these simple steps:

1. **Install Dependencies**  
   From the project directory, run:
   ```bash
   npm install
   ```

2. **Start the Development Server**
   Start your Next.js local instance:
   ```bash
   npm run dev
   ```

3. **Open the App in Your Browser**
   Once the server is running, open your web browser and navigate to the application:
   [http://localhost:3000](http://localhost:3000)

4. **Analyze Your Mails**
   - Click the dashboard upload area.
   - Supply a standard `.mbox` export file (can be generated through Apple Mail or Google Takeout).
   - Let the dashboard dynamically update your application states!

## Frameworks Under the Hood
- Next.js (App Router API endpoints)
- React UI Components
- Node-Mbox Engine
- Mailparser Decoder
