/**
 * Utility to create a cropped image from a source image and crop area.
 * Used with react-easy-crop's onCropComplete callback.
 */

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

/**
 * Crop an image and return the result as a Blob.
 *
 * @param imageSrc - The source image URL (object URL or remote)
 * @param pixelCrop - The crop area in pixels from react-easy-crop
 * @param outputType - The output MIME type (default: "image/jpeg")
 * @param quality - The output quality 0-1 (default: 0.9)
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputType = "image/jpeg",
  quality = 0.9,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob returned null"));
        }
      },
      outputType,
      quality,
    );
  });
}
