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

    const token = process.env.HUGGINGFACE_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json(
        {
          error:
            'The Hugging Face API key is not configured yet. Add it in Project Settings to enable image generation.',
          missingKey: true,
        },
        { status: 503 },
      )
    }

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
      // Model still loading is a common, retryable HF state.
      if (res.status === 503) {
        return NextResponse.json(
          { error: 'The image model is warming up. Try again in a few seconds.' },
          { status: 503 },
        )
      }
      throw new Error(`HuggingFace ${res.status}: ${detail.slice(0, 200)}`)
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
    return NextResponse.json({ image: dataUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.log('[v0] image route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
