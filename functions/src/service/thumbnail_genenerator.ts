import axios from "axios";
import sharp from "sharp";

import { fileTypeFromBuffer, FileTypeResult } from "file-type";

interface GenerateThumbnailRespose {
  buffer?: Buffer<ArrayBufferLike>;
  filename?: string;
  contentType?: string;
}

interface ImageData {
  url: string;
  id: number;
}

interface GenerateThumbnailRequest {
  image: ImageData;
  size: number;
}

class ThumbnailGeneratorService {
  constructor() {}

  generateThumbnail = async (
    request: GenerateThumbnailRequest
  ): Promise<GenerateThumbnailRespose> => {
    let fileName = `abc_store_${new Date().getTime()}`;
    let thumbnail: Buffer<ArrayBufferLike> | undefined;
    let type: FileTypeResult | undefined;

    try {
      if (request.image.url === undefined) {
        throw new Error("Invalid image url provided");
      }
      const imageBuffer = await axios.get(request.image.url, {
        responseType: "arraybuffer",
      });

      type = await fileTypeFromBuffer(imageBuffer.data);

      if (!type) {
        throw new Error("File type not found");
      }

      fileName += `.${type.ext}`;

      const padding = 10;
      const background = { r: 255, g: 255, b: 255, alpha: 0.0 };
      thumbnail = await sharp(imageBuffer.data)
        .resize(request.size, request.size, {
          fit: "contain",
          background,
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background,
        })
        .toBuffer();
    } catch (err) {
      throw err as Error;
    }

    return {
      buffer: thumbnail,
      filename: fileName,
      contentType: type?.mime,
    };
  };
}

export {
  ImageData,
  GenerateThumbnailRequest,
  GenerateThumbnailRespose,
  ThumbnailGeneratorService,
};
