import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Upload, Languages, Wand2, Download, Clock, Zap, Globe, CheckCircle2, Sparkles, HelpCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 gradient-bg"></div>
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">VoiceSync</h1>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Transform Your Audio Content For Global Audiences
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Instantly translate and dub your audio content with perfect timing and natural voices.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  100% Free
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  No Login Required
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Instant Processing
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  Professional Quality
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/upload">Get Started Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10" asChild>
                  <Link href="#how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Powerful Features</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to transform your audio content for global audiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Accurate Translation</h3>
                <p className="text-muted-foreground">
                  Powered by advanced AI models to ensure accurate and natural-sounding translations in multiple
                  languages.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Perfect Timing</h3>
                <p className="text-muted-foreground">
                  Our technology ensures the dubbed audio matches the original timeline for a seamless listening
                  experience.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Instant Processing</h3>
                <p className="text-muted-foreground">
                  Get your translated and dubbed audio in minutes, not hours or days. No waiting for manual processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-card/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">How It Works</h2>
              <p className="text-lg text-muted-foreground">Transform your audio content in just a few simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">1. Upload</h3>
                <p className="text-muted-foreground">Upload your audio file and select source and target languages</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">2. Process</h3>
                <p className="text-muted-foreground">Our AI transcribes, translates, and generates dubbed audio</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">3. Review</h3>
                <p className="text-muted-foreground">
                  Preview the results with side-by-side audio players and subtitles
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">4. Download</h3>
                <p className="text-muted-foreground">Download your dubbed audio and subtitle files</p>
              </div>
            </div>
          </div>
        </section>

        {/* Languages Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Supported Languages</h2>
              <p className="text-lg text-muted-foreground">
                Reach global audiences with support for multiple languages
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                "English",
                "Spanish",
                "French",
                "German",
                "Italian",
                "Portuguese",
                "Chinese",
                "Russian",
                "Arabic",
                "Hindi",
              ].map((language) => (
                <div key={language} className="bg-card rounded-lg p-4 text-center border border-border">
                  <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm">{language}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-card/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Frequently Asked Questions</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about VoiceSync
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    How long does audio processing take?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Processing time varies depending on the length and complexity of your audio file. 
                    Most files are processed within 2-5 minutes. Longer files may take up to 10-15 minutes. 
                    You can monitor the progress in real-time during processing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What audio file formats are supported?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We support most common audio formats including MP3, WAV, M4A, AAC, FLAC, and OGG. 
                    The maximum file size is 50MB. For best results, we recommend using high-quality audio files 
                    with clear speech and minimal background noise.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    How accurate are the translations?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Our AI-powered translation system provides high accuracy for most content types. 
                    The accuracy depends on factors like audio quality, speaking clarity, language pair, 
                    and content complexity. We use advanced models including DeepSeek for translation 
                    to ensure natural and contextually appropriate results.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Is my data secure and private?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, we take data security seriously. All uploaded files are encrypted during transmission 
                    and processing. Your audio files are automatically deleted from our servers within 24 hours 
                    of upload. We do not store or share your content with third parties.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Can I download the translated audio and subtitles?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Absolutely! After processing is complete, you can download the dubbed audio file in MP3 format 
                    and subtitle files in both SRT and VTT formats. The download links remain active for 24 hours 
                    after processing completion.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Do I need to create an account to use VoiceSync?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    No registration is required! VoiceSync is completely free to use without creating an account. 
                    Simply upload your audio file, select your languages, and start the translation process. 
                    This makes it quick and easy to get started immediately.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What languages are supported for translation?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We currently support translation between 10+ major languages including English, Spanish, 
                    French, German, Italian, Portuguese, Chinese, Russian, Arabic, and Hindi. 
                    We're continuously working to add support for more languages based on user demand.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Can I use VoiceSync for commercial purposes?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, you can use VoiceSync for both personal and commercial projects. However, please ensure 
                    that you have the necessary rights to the original audio content you're translating. 
                    You're responsible for complying with copyright and intellectual property laws.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
