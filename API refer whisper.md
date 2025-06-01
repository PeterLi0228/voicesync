## Basic model info

Model name: openai/whisper
Model description: Convert speech in audio to text


## Model inputs

- audio: Audio file (string)
- transcription: Choose the format for the transcription (string)
- translate: Translate the text to English when set to True (boolean)
- language: Language spoken in the audio, specify 'auto' for automatic language detection (string)
- temperature: temperature to use for sampling (number)
- patience: optional patience value to use in beam decoding, as in https://arxiv.org/abs/2204.05424, the default (1.0) is equivalent to conventional beam search (number)
- suppress_tokens: comma-separated list of token ids to suppress during sampling; '-1' will suppress most special characters except common punctuations (string)
- initial_prompt: optional text to provide as a prompt for the first window. (string)
- condition_on_previous_text: if True, provide the previous output of the model as a prompt for the next window; disabling may make the text inconsistent across windows, but the model becomes less prone to getting stuck in a failure loop (boolean)
- temperature_increment_on_fallback: temperature to increase when falling back when the decoding fails to meet either of the thresholds below (number)
- compression_ratio_threshold: if the gzip compression ratio is higher than this value, treat the decoding as failed (number)
- logprob_threshold: if the average log probability is lower than this value, treat the decoding as failed (number)
- no_speech_threshold: if the probability of the <|nospeech|> token is higher than this value AND the decoding has failed due to `logprob_threshold`, consider the segment as silence (number)


## Model output schema

{
  "type": "object",
  "title": "Output",
  "required": [
    "detected_language",
    "transcription"
  ],
  "properties": {
    "segments": {
      "title": "Segments"
    },
    "srt_file": {
      "type": "string",
      "title": "Srt File",
      "format": "uri"
    },
    "txt_file": {
      "type": "string",
      "title": "Txt File",
      "format": "uri"
    },
    "translation": {
      "type": "string",
      "title": "Translation"
    },
    "transcription": {
      "type": "string",
      "title": "Transcription"
    },
    "detected_language": {
      "type": "string",
      "title": "Detected Language"
    }
  }
}

If the input or output schema includes a format of URI, it is referring to a file.


## Example inputs and outputs

Use these example outputs to better understand the types of inputs the model accepts, and the types of outputs the model returns:

### Example (https://replicate.com/p/4bzv3trbxdeyon73ve6itzvycq)

#### Input

```json
{
  "audio": "https://replicate.delivery/mgxm/e5159b1b-508a-4be4-b892-e1eb47850bdc/OSR_uk_000_0050_8k.wav",
  "model": "large-v3",
  "translate": false,
  "temperature": 0,
  "transcription": "plain text",
  "suppress_tokens": "-1",
  "logprob_threshold": -1,
  "no_speech_threshold": 0.6,
  "condition_on_previous_text": true,
  "compression_ratio_threshold": 2.4,
  "temperature_increment_on_fallback": 0.2
}
```

#### Output

```json
{
  "segments": [
    {
      "id": 0,
      "end": 18.6,
      "seek": 0,
      "text": " the little tales they tell are false the door was barred locked and bolted as well ripe pears are fit for a queen's table a big wet stain was on the round carpet",
      "start": 0,
      "tokens": [
        50365,
        264,
        707,
        27254,
        436,
        980,
        366,
        7908,
        264,
        2853,
        390,
        2159,
        986,
        9376,
        293,
        13436,
        292,
        382,
        731,
        31421,
        520,
        685,
        366,
        3318,
        337,
        257,
        12206,
        311,
        3199,
        257,
        955,
        6630,
        16441,
        390,
        322,
        264,
        3098,
        18119,
        51295
      ],
      "avg_logprob": -0.060722851171726135,
      "temperature": 0,
      "no_speech_prob": 0.05907342955470085,
      "compression_ratio": 1.412280701754386
    },
    {
      "id": 1,
      "end": 31.840000000000003,
      "seek": 1860,
      "text": " the kite dipped and swayed but stayed aloft the pleasant hours fly by much too soon the room was crowded with a mild wab",
      "start": 18.6,
      "tokens": [
        50365,
        264,
        38867,
        45162,
        293,
        27555,
        292,
        457,
        9181,
        419,
        6750,
        264,
        16232,
        2496,
        3603,
        538,
        709,
        886,
        2321,
        264,
        1808,
        390,
        21634,
        365,
        257,
        15154,
        261,
        455,
        51027
      ],
      "avg_logprob": -0.1184891973223005,
      "temperature": 0,
      "no_speech_prob": 0.000253104604780674,
      "compression_ratio": 1.696969696969697
    },
    {
      "id": 2,
      "end": 45.2,
      "seek": 1860,
      "text": " the room was crowded with a wild mob this strong arm shall shield your honour she blushed when he gave her a white orchid",
      "start": 31.840000000000003,
      "tokens": [
        51027,
        264,
        1808,
        390,
        21634,
        365,
        257,
        4868,
        4298,
        341,
        2068,
        3726,
        4393,
        10257,
        428,
        20631,
        750,
        25218,
        292,
        562,
        415,
        2729,
        720,
        257,
        2418,
        34850,
        327,
        51695
      ],
      "avg_logprob": -0.1184891973223005,
      "temperature": 0,
      "no_speech_prob": 0.000253104604780674,
      "compression_ratio": 1.696969696969697
    },
    {
      "id": 3,
      "end": 48.6,
      "seek": 1860,
      "text": " the beetle droned in the hot june sun",
      "start": 45.2,
      "tokens": [
        51695,
        264,
        49735,
        1224,
        19009,
        294,
        264,
        2368,
        361,
        2613,
        3295,
        51865
      ],
      "avg_logprob": -0.1184891973223005,
      "temperature": 0,
      "no_speech_prob": 0.000253104604780674,
      "compression_ratio": 1.696969696969697
    },
    {
      "id": 4,
      "end": 52.38,
      "seek": 4860,
      "text": " the beetle droned in the hot june sun",
      "start": 48.6,
      "tokens": [
        50365,
        264,
        49735,
        1224,
        19009,
        294,
        264,
        2368,
        361,
        2613,
        3295,
        50554
      ],
      "avg_logprob": -0.30115177081181455,
      "temperature": 0.2,
      "no_speech_prob": 0.292143315076828,
      "compression_ratio": 0.8409090909090909
    }
  ],
  "translation": null,
  "transcription": " the little tales they tell are false the door was barred locked and bolted as well ripe pears are fit for a queen's table a big wet stain was on the round carpet the kite dipped and swayed but stayed aloft the pleasant hours fly by much too soon the room was crowded with a mild wab the room was crowded with a wild mob this strong arm shall shield your honour she blushed when he gave her a white orchid the beetle droned in the hot june sun the beetle droned in the hot june sun",
  "detected_language": "english"
}
```


## Model readme

> # Whisper Large-v3
> 
> Whisper is a general-purpose speech recognition model. It is trained on a large dataset of diverse audio and is also a multi-task model that can perform multilingual speech recognition, translation, and language identification.
> 
> This version runs only the most recent Whisper model, `large-v3`. It's optimized for high performance and simplicity.
> 
> ## Model Versions
> 
> | Model Size | Version | 
> | ---  | --- | 
> | large-v3 | [link](https://replicate.com/openai/whisper/versions/3c08daf437fe359eb158a5123c395673f0a113dd8b4bd01ddce5936850e2a981) |
> | large-v2 | [link](https://replicate.com/openai/whisper/versions/e39e354773466b955265e969568deb7da217804d8e771ea8c9cd0cef6591f8bc) |
> | all others | [link](https://replicate.com/openai/whisper/versions/30414ee7c4fffc37e260fcab7842b5be470b9b840f2b608f5baa9bbef9a259ed) | 
> 
> While this implementation only uses the `large-v3` model, we maintain links to previous versions for reference.
> 
> For users who need different model sizes, check out our [multi-model version](https://replicate.com/zsxkib/whisper-lazyloading).
> 
> ## Model Description
> 
> ![Approach](https://github.com/openai/whisper/blob/main/approach.png?raw=true)
> 
> Whisper uses a Transformer sequence-to-sequence model trained on various speech processing tasks, including multilingual speech recognition, speech translation, spoken language identification, and voice activity detection. All of these tasks are jointly represented as a sequence of tokens to be predicted by the decoder, allowing for a single model to replace many different stages of a traditional speech processing pipeline.
> 
> [[Blog]](https://openai.com/blog/whisper)
> [[Paper]](https://cdn.openai.com/papers/whisper.pdf)
> [[Model card]](model-card.md)
> 
> ## License
> 
> The code and model weights of Whisper are released under the MIT License. See [LICENSE](https://github.com/openai/whisper/blob/main/LICENSE) for further details.
> 
> ## Citation
> 
> ```
> @misc{https://doi.org/10.48550/arxiv.2212.04356,
>   doi = {10.48550/ARXIV.2212.04356},
>   url = {https://arxiv.org/abs/2212.04356},
>   author = {Radford, Alec and Kim, Jong Wook and Xu, Tao and Brockman, Greg and McLeavey, Christine and Sutskever, Ilya},
>   title = {Robust Speech Recognition via Large-Scale Weak Supervision},
>   publisher = {arXiv},
>   year = {2022},
>   copyright = {arXiv.org perpetual, non-exclusive license}
> }
> ```

