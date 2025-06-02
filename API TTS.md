## Basic model info

Model name: lucataco/xtts-v2
Model description: Coqui XTTS-v2: Multilingual Text To Speech Voice Cloning


## Model inputs

- text: Text to synthesize (string)
- speaker: Original speaker audio (wav, mp3, m4a, ogg, or flv) (string)
- language: Output language for the synthesised speech (string)
- cleanup_voice: Whether to apply denoising to the speaker audio (microphone recordings) (boolean)


## Model output schema

{
  "type": "string",
  "title": "Output",
  "format": "uri"
}

If the input or output schema includes a format of URI, it is referring to a file.


## Example inputs and outputs

Use these example outputs to better understand the types of inputs the model accepts, and the types of outputs the model returns:

### Example (https://replicate.com/p/7qfm5cbbsdivydzlc35abwxjqq)

#### Input

```json
{
  "text": "Cuando ten\u00eda seis a\u00f1os, vi una vez una imagen magn\u00edfica",
  "language": "es",
  "speaker_wav": "https://replicate.delivery/pbxt/JqzvJMqmYeWjdUSULrjJbEYjsYUnd335Keufr2QyMCGKJtY4/male.wav"
}
```

#### Output

```json
"https://replicate.delivery/pbxt/wwqNm5bNhGaoERcKWOe3tN7v2xrKhBxL2srKyzCCTLJL4g7IA/output.wav"
```


## Model readme

> This model expects that you use at least 6 seconds of audio
> 
> _Note: Dont include spaces in your input audio file name_
> 
> # About
> 
> XTTS-v2 the Open, Foundation Speech Model by Coqui 🐸
> 
> Language Settings: English: en 🇺🇸 French: fr 🇫🇷 German: de 🇩🇪 Spanish: es 🇪🇸 Italian: it 🇮🇹 Portuguese: pt 🇵🇹 Czech: cs 🇨🇿 Polish: pl 🇵🇱 Russian: ru 🇷🇺 Dutch: nl 🇳🇱 Turksih: tr 🇹🇷 Arabic: ar 🇦🇪 Mandarin Chinese: zh-cn 🇨🇳
> 
> # Changelog
> 11/28/23 - Added Hindi support
