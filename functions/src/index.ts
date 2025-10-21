/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import initialiseApp from "./initialiseApp.js";
import { ThumbnailGeneratorService } from "./service/thumbnail_genenerator.js";
import {
  FirebaseStorageService,
  StorageUploadRequest,
} from "./service/firebase_storage.js";

setGlobalOptions({ maxInstances: 2 });

initialiseApp();

export const generateAndStoreThubmnail = onRequest(
  async (request, response) => {
    const { url, size } = request.body;
    const storageService = new FirebaseStorageService();

    try {
      const sizeCast = Number(size);
      if (isNaN(sizeCast)) {
        throw new Error("Invalid size provided");
      }

      const result = await ThumbnailGeneratorService.generateThumbnail({
        url,
        size: sizeCast,
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
      response.send({ thumbnailUrl });
    } catch (err) {
      logger.error(err);
      response.status(500).send({ error: err });
    }
  }
);
