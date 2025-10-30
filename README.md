# Hiremind - AI-Powered Interview Automation Platform

An advanced AI-powered interview automation platform designed to modernize and streamline the technical hiring process.

## Features

- **Modern UI/UX**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Dark Mode Support**: Beautiful dark theme with shadcn/ui components
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Role-based Dashboards**: Separate interfaces for recruiters and candidates
- **AI-Powered Tools**: Designed for AI-assisted interview automation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hiremind-platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with dark mode
│   ├── page.tsx             # Landing page
│   ├── recruiter/
│   │   └── page.tsx         # Recruiter dashboard
│   └── candidate/
│       └── page.tsx         # Candidate dashboard
├── components/
│   └── ui/
│       └── button.tsx       # shadcn/ui Button component
└── lib/
    └── utils.ts             # Utility functions
```

## Pages

### Landing Page (`/`)
- Modern hero section with company branding
- Two main action buttons: "Sign in as Recruiter" and "Sign in as Candidate"
- Feature highlights section
- Responsive design with dark mode

### Recruiter Dashboard (`/recruiter`)
- Overview of hiring metrics
- Quick actions for managing candidates
- Recent activity feed
- Navigation back to home

### Candidate Dashboard (`/candidate`)
- Application tracking
- Interview scheduling
- Progress metrics
- Recent applications and upcoming interviews

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Colors and Theme
The project uses CSS custom properties for theming. Colors can be modified in `src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  /* ... other color variables */
}
```

### Adding New Components
Follow the shadcn/ui pattern for new components:

1. Create component in `src/components/ui/`
2. Use the `cn()` utility for class merging
3. Export with proper TypeScript interfaces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 