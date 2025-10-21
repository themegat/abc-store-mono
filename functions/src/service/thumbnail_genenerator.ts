import axios from "axios";
import sharp from "sharp";

import { fileTypeFromBuffer } from "file-type";

type GenerateThumbnailRespose = {
  buffer?: Buffer<ArrayBufferLike>;
  filename?: string;
  contentType?: string;
};

type GenerateThumbnailRequest = {
  url: string;
  size: number;
};

class ThumbnailGeneratorService {
  static generateThumbnail = async (
    request: GenerateThumbnailRequest
  ): Promise<GenerateThumbnailRespose> => {
    let fileName = `abc_store_${new Date().getTime()}`;

    return new Promise(async (resolve, reject) => {
      try {
        if (request.url === undefined) {
          throw new Error("Invalid image url provided");
        }
        const imageBuffer = await axios
          .get(request.url, {
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

        const thumbnail = await sharp(imageBuffer.data)
          .resize(request.size, request.size)
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
  GenerateThumbnailRequest,
  GenerateThumbnailRespose,
  ThumbnailGeneratorService,
};
