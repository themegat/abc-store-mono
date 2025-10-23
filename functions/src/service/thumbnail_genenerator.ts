import axios from "axios";
import sharp from "sharp";

import { fileTypeFromBuffer } from "file-type";

type GenerateThumbnailRespose = {
  buffer?: Buffer<ArrayBufferLike>;
  filename?: string;
  contentType?: string;
};

type ImageData = {
  url: string;
  id: number;
};

type GenerateThumbnailRequest = {
  image: ImageData;
  size: number;
};

class ThumbnailGeneratorService {
  static generateThumbnail = async (
    request: GenerateThumbnailRequest
  ): Promise<GenerateThumbnailRespose> => {
    let fileName = `abc_store_${new Date().getTime()}`;

    return new Promise(async (resolve, reject) => {
      try {
        if (request.image.url === undefined) {
          throw new Error("Invalid image url provided");
        }
        const imageBuffer = await axios
          .get(request.image.url, {
            responseType: "arraybuffer",
          })
          .catch((err) => {
            throw new Error(err);
          });

        const type = await fileTypeFromBuffer(imageBuffer.data).catch((err) => {
          throw new Error(err);
        });

        if (!type) {
          throw new Error("File type not found");
        }

        fileName += `.${type.ext}`;

        const padding = 10;
        const background = { r: 255, g: 255, b: 255, alpha: 0.0 };
        const thumbnail = await sharp(imageBuffer.data)
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

        resolve({
          buffer: thumbnail,
          filename: fileName,
          contentType: type.mime,
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

export {
  ImageData,
  GenerateThumbnailRequest,
  GenerateThumbnailRespose,
  ThumbnailGeneratorService,
};
