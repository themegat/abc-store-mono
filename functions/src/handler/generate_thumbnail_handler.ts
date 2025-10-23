import { logger, Request, Response } from "firebase-functions/v1";
import {
  FirebaseStorageService,
  StorageUploadRequest,
} from "../service/firebase_storage.js";
import {
  ImageData,
  ThumbnailGeneratorService,
} from "../service/thumbnail_genenerator.js";

const GenerateThunbnailHandler = async (
  request: Request,
  response: Response
) => {
  const bodyJson = request.body;
  const size: number = bodyJson.size;
  const images: ImageData[] = bodyJson.images;

  const storageService = new FirebaseStorageService();
  try {
    const thumbnailUrls = await Promise.all(
      images.map((image: ImageData) =>
        generateThumbnail(image, size, storageService)
      )
    ).catch((err) => {
      throw new Error(err);
    });

    response.status(200).send({ data: thumbnailUrls });

    response.send();
  } catch (err) {
    logger.error(err);
    response.status(500).send({ error: err });
  }
};

const generateThumbnail = (
  image: ImageData,
  size: number,
  storageService: FirebaseStorageService
): Promise<ImageData> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await ThumbnailGeneratorService.generateThumbnail({
        image,
        size: size,
      }).catch((err) => {
        throw new Error(err);
      });

      if (!result.buffer || !result.filename || !result.contentType) {
        throw new Error("Unable to generate thumbnail");
      }
      const uploadRequest: StorageUploadRequest = {
        filename: result.filename,
        buffer: result.buffer,
        contentType: result.contentType,
      };
      const { url: thumbnailUrl } =
        await storageService.uploadThumbnail(uploadRequest);
      resolve({ url: thumbnailUrl, id: image.id });
    } catch (err) {
      reject(err);
    }
  });
};

export default GenerateThunbnailHandler;
