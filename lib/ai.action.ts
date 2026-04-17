import { puter } from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";



export async function fetchhasdataurl(url: string): Promise<string> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch image: ${response.status} ${response.statusText}`
		);
	}

	const blob = await response.blob();

	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
				return;
			}

			reject(new Error("FileReader did not return a data URL string."));
		};

		reader.onerror = () => {
			reject(reader.error ?? new Error("Failed to read blob as data URL."));
		};

		reader.readAsDataURL(blob);
	});
}

export const generate3DView = async ({sourceImage}:Generate3DViewParams)=>{
    const dataUrl = sourceImage.startsWith("data:") ? sourceImage : await fetchhasdataurl(sourceImage);
    const base64Data = dataUrl.split(",")[1];
    const mimeType =dataUrl.split(",")[0].split(":")[1].split(";")[0];
	const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
	if(!mimeType || !base64Data || !allowedMimeTypes.includes(mimeType)) throw new Error("Invalid image data");
    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT,{
        provider:"gemini",
        model:"gemini-2.5-flash-image-preview",
        input_image:base64Data,
        input_image_mime_type: mimeType,
        ratio:{w:1024,h:1024}
    })
    const rawImageUrl = (response as HTMLImageElement).src ?? null;
    if(!rawImageUrl) throw new Error("Failed to generate image");
    const renderedImage = rawImageUrl.startsWith("data:") ? rawImageUrl : await fetchhasdataurl(rawImageUrl);
    return {renderedImage, renderedPath:undefined};
}