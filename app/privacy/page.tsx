import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy - VoiceSync",
  description: "VoiceSync Privacy Policy - How we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to VoiceSync. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              website and use our services, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Audio Files</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We temporarily process audio files you upload for translation and dubbing purposes. 
                  These files are processed on our secure servers and are automatically deleted after processing.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information about how you use our service, including processing times, 
                  language selections, and feature usage to improve our service quality.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Technical Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect IP addresses, browser types, device information, and other technical data 
                  for security and service optimization purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our audio translation and dubbing services</li>
              <li>To process your audio files and deliver translated content</li>
              <li>To improve our AI models and service quality</li>
              <li>To communicate with you about our services</li>
              <li>To ensure the security and integrity of our platform</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data 
              against unauthorized access, alteration, disclosure, or destruction. All audio files are 
              processed using encrypted connections and are automatically deleted after processing completion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Audio files are temporarily stored only during the processing period and are automatically 
              deleted within 24 hours of upload. Processed results may be cached for up to 7 days to 
              improve user experience, after which they are permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service integrates with third-party AI providers (OpenAI Whisper, DeepSeek, XTTS-v2) 
              for audio processing. These providers have their own privacy policies and data handling practices. 
              We ensure that all third-party integrations comply with applicable data protection standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under applicable data protection laws, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to ensure our website functions properly. We do not use tracking 
              cookies or third-party advertising cookies. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">Email: VoiceSync@like228.com</p>
              <p className="text-sm text-muted-foreground mt-1">
                We will respond to your inquiry within 48 hours.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 