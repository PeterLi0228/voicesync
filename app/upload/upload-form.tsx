"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/file-upload"
import { LanguageSelector } from "@/components/language-selector"

export function UploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>("")
  const [targetLanguage, setTargetLanguage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError("Please upload an audio file.")
      return
    }

    if (!sourceLanguage) {
      setError("Please select a source language.")
      return
    }

    if (!targetLanguage) {
      setError("Please select a target language.")
      return
    }

    if (sourceLanguage === targetLanguage) {
      setError("Source and target languages must be different.")
      return
    }

    setIsSubmitting(true)

    try {
      // 将音频文件转换为base64并保存到localStorage
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        localStorage.setItem('uploadedAudio', base64Data)
        
        // 跳转到处理页面，传递参数
        const params = new URLSearchParams({
          audioFile: file.name,
          sourceLanguage,
          targetLanguage
        })
        
        router.push(`/processing?${params.toString()}`)
      }
      
      reader.onerror = () => {
        throw new Error('Failed to read file')
      }
      
      reader.readAsDataURL(file)
      
    } catch (err) {
      setError("An error occurred while uploading your file. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          {/* File Upload */}
          <div className="mb-6">
            <Label className="mb-2 block">
              Audio File (MP3 or WAV)
            </Label>
            <FileUpload onFileSelect={setFile} />
          </div>

          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LanguageSelector
              value={sourceLanguage}
              onValueChange={setSourceLanguage}
              label="Source Language"
              placeholder="Select source language"
              id="source-language"
              disabled={isSubmitting}
            />

            <LanguageSelector
              value={targetLanguage}
              onValueChange={setTargetLanguage}
              label="Target Language"
              placeholder="Select target language"
              id="target-language"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!file || !sourceLanguage || !targetLanguage || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Translation"
            )}
          </Button>

          {/* Info */}
          <p className="text-sm text-muted-foreground text-center mt-4">
            Processing typically takes 2-5 minutes depending on file size
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
