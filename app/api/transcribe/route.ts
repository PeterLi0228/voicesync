import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 将文件转换为base64或使用临时URL
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');
    const dataUrl = `data:${audioFile.type};base64,${base64Audio}`;

    // 调用Replicate API创建预测
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN_WHISPER}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "3c08daf437fe359eb158a5123c395673f0a113dd8b4bd01ddce5936850e2a981",
        input: {
          audio: dataUrl,
          model: "large-v3",
          transcription: "plain text",
          translate: false,
          language: "auto",
          temperature: 0,
          suppress_tokens: "-1",
          logprob_threshold: -1,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
          temperature_increment_on_fallback: 0.2
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Replicate API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to process audio with Replicate API', details: errorData },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    
    // 返回预测ID，前端可以用来轮询状态
    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
      data: prediction
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('id');
    
    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // 获取预测状态
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN_WHISPER}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Replicate API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get prediction status' },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    
    return NextResponse.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('Get prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 