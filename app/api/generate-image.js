import { NextResponse } from 'next/server';
import { StableDiffusionPipeline } from '@google/generative-ai';

const model_id = "runwayml/stable-diffusion-v1-5";

export async function POST(req) {
    try {
        const { character } = await req.json();

        // Replace this prompt with a more character-specific one if needed
        const prompt = `A detailed image of ${character} from Disney.`;

        // Load the model and generate the image
        const pipe = await StableDiffusionPipeline.from_pretrained(model_id);
        const image = await pipe(prompt).images[0];

        // Convert the image to a blob and send it back
        const buffer = await image.toBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': 'inline; filename="character.png"',
            },
        });
    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
}
