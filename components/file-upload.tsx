"use client"

import React, { useState, useCallback } from "react"
import { Upload, FileAudio, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  acceptedTypes?: string[]
  maxSize?: number // in bytes
  className?: string
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = ["audio/mp3", "audio/wav", "audio/mpeg"],
  maxSize = 50 * 1024 * 1024, // 50MB
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return "Please upload an MP3 or WAV file."
      }

      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB.`
      }

      return null
    },
    [acceptedTypes, maxSize]
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setSelectedFile(null)
        onFileSelect(null)
        return
      }

      setError(null)
      setSelectedFile(file)
      onFileSelect(file)
    },
    [validateFile, onFileSelect]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
    onFileSelect(null)
    // Reset the input
    const input = document.getElementById("audio-file") as HTMLInputElement
    if (input) {
      input.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : selectedFile
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : error
                ? "border-destructive bg-destructive/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("audio-file")?.click()}
      >
        <input
          type="file"
          id="audio-file"
          accept={acceptedTypes.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <FileAudio className="h-10 w-10 text-green-500 mb-2" />
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatFileSize(selectedFile.size)}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-medium">Drag and drop your audio file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (MP3 or WAV, max {Math.round(maxSize / (1024 * 1024))}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 