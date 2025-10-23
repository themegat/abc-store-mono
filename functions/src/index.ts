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
// import initialiseApp from "./initialiseApp.js";
import GenerateThunbnailHandler from "./handler/generate_thumbnail_handler.js";

setGlobalOptions({ maxInstances: 2 });

// initialiseApp();

export const generateAndStoreThubmnail = onRequest(
  async (request, response) => await GenerateThunbnailHandler(request, response)
);
