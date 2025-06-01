# VoiceSync - Audio Translation & Dubbing Platform

VoiceSync is a modern web application that transforms audio content for global audiences using AI-powered translation and dubbing technology. Built with Next.js 15 and React 19, it provides a seamless experience for translating and dubbing audio files across multiple languages.

## ✨ Features

### Core Functionality
- **Audio Translation**: Convert audio content from one language to another
- **AI-Powered Dubbing**: Generate natural-sounding voice dubbing
- **Perfect Timing Sync**: Maintain original audio timing and pacing
- **Subtitle Generation**: Create SRT and VTT subtitle files
- **Multi-Language Support**: Support for 12+ languages including English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Russian, Arabic, and Hindi

### User Experience
- **Drag & Drop Upload**: Easy file upload with validation
- **Real-time Processing**: Live progress tracking with detailed steps
- **Audio Player**: Custom audio player with controls
- **Side-by-Side Comparison**: Compare original and translated audio
- **Download Options**: Multiple export formats (MP3, SRT, VTT)

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching
- **Error Handling**: Comprehensive error boundaries and validation
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with Tailwind CSS and Radix UI components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/voice-sync-platform.git
cd voice-sync-platform
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### UI Components
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Beautiful icons
- **Sonner**: Toast notifications
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## 📁 Project Structure

```
voice-sync-platform/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── upload/            # Upload page
│   ├── processing/        # Processing page
│   └── result/            # Results page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── audio-player.tsx  # Custom audio player
│   ├── file-upload.tsx   # File upload component
│   ├── language-selector.tsx # Language selection
│   ├── error-boundary.tsx # Error handling
│   ├── loading.tsx       # Loading states
│   ├── navbar.tsx        # Navigation
│   └── footer.tsx        # Footer
├── hooks/                # Custom React hooks
│   └── use-processing-state.ts
├── lib/                  # Utility functions
│   ├── utils.ts          # General utilities
│   └── audio-utils.ts    # Audio-specific utilities
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🎯 Usage

### 1. Upload Audio File
- Navigate to the upload page
- Drag and drop an audio file (MP3 or WAV, max 50MB)
- Or click to browse and select a file

### 2. Select Languages
- Choose the source language of your audio
- Select the target language for translation
- Ensure source and target languages are different

### 3. Process Audio
- Click "Start Translation" to begin processing
- Monitor real-time progress through 5 processing steps:
  1. Transcribing audio
  2. Translating content
  3. Generating voice
  4. Aligning audio
  5. Finalizing

### 4. Review Results
- Listen to original and translated audio side-by-side
- Review generated subtitles with timestamps
- Compare original and translated text

### 5. Download Files
- Download dubbed audio (MP3)
- Download subtitles (SRT or VTT format)
- Files available for 24 hours

## 🎨 Customization

### Themes
The application supports both light and dark themes with automatic system detection. Users can manually toggle between themes using the theme switcher in the navigation.

### Languages
To add support for additional languages, update the `languages` array in `components/language-selector.tsx`:

```typescript
export const languages = [
  { value: "new-lang", label: "New Language", flag: "🏳️" },
  // ... existing languages
]
```

### Styling
The project uses Tailwind CSS with a custom design system. Colors and spacing can be customized in:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - CSS custom properties
- `components/ui/` - Component-specific styles

## 🔧 API Integration

Currently, the application uses mock data for demonstration. To integrate with real APIs:

1. **File Upload**: Replace the mock upload in `app/upload/upload-form.tsx`
2. **Processing**: Implement real processing endpoints
3. **Audio Generation**: Connect to AI dubbing services
4. **Download**: Implement file serving endpoints

Example API integration:

```typescript
// In upload-form.tsx
const handleSubmit = async (formData: FormData) => {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
  
  const result = await response.json()
  // Handle response
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Build command:
```bash
pnpm build
```

Start command:
```bash
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

For support, email support@voicesync.app or join our Discord community.

---

Built with ❤️ by the VoiceSync Team 