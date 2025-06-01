import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UploadForm } from "./upload-form"

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Audio</h1>
              <p className="text-lg text-muted-foreground">
                Upload your audio file and select languages to start the translation and dubbing process
              </p>
            </div>

            <UploadForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
