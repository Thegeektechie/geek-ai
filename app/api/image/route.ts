import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0'

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string }
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Describe the image you want.' }, { status: 400 })
    }

    const token = process.env.HUGGINGFACE_ACCESS_TOKEN || process.env.HUGGINGFACE_ACCESS_TOKEN_2
    if (!token) {
      console.log('[v0] Hugging Face token not found - missing environment variable')
      return NextResponse.json(
        {
          error:
            'The Hugging Face API key is not configured yet. Add it in Project Settings to enable image generation.',
          missingKey: true,
        },
        { status: 503 },
      )
    }

    console.log('[v0] Image generation request - model:', HF_MODEL, 'prompt length:', prompt.length)

    const res = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'image/png',
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true },
        }),
      },
    )

    if (!res.ok) {
      const detail = await res.text()
      console.log('[v0] Hugging Face error response:', res.status, detail.slice(0, 100))
      
      // Model still loading or service busy - common, retryable state
      if (res.status === 503 || res.status === 429) {
        return NextResponse.json(
          { 
            error: 'Image service is experiencing high traffic. Please try again in a few moments.',
            isHighTraffic: true,
          },
          { status: 503 },
        )
      }
      
      // Generic failure
      throw new Error('image-generation-failed')
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
    console.log('[v0] Image generation success - buffer size:', buffer.length)
    return NextResponse.json({ image: dataUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.log('[v0] image route error:', message)
    
    // Don't expose technical errors to user
    return NextResponse.json(
      { 
        error: 'Image service is experiencing high traffic. Please try again in a few moments.',
        isHighTraffic: true,
      },
      { status: 503 },
    )
  }
}
