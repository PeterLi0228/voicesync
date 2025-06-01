"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
]

interface LanguageSelectorProps {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder: string
  id?: string
  disabled?: boolean
}

export function LanguageSelector({
  value,
  onValueChange,
  label,
  placeholder,
  id,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 