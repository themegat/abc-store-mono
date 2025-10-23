import {
  connectStorageEmulator,
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

interface StorageUploadRequest {
  filename: string;
  buffer: Buffer<ArrayBufferLike>;
  contentType: string;
}

interface StorageUploadResponse {
  url: string;
}

class FirebaseStorageService {
  private readonly storage: FirebaseStorage;
  constructor() {
    this.storage = getStorage();
    //Connect to local emulator if running locally
    if (location.hostname === "localhost") {
      connectStorageEmulator(this.storage, "127.0.0.1", 9199);
    }
  }

  uploadThumbnail(
    request: StorageUploadRequest
  ): Promise<StorageUploadResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const fileRef = ref(
          this.storage,
          `images/thumbnails/${request.filename}`
        );

        await uploadBytes(fileRef, request.buffer).catch((err) => {
          throw new Error(err);
        });

        const url = await getDownloadURL(fileRef).catch((err) => {
          throw new Error(err);
        });

        resolve({ url });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export { StorageUploadRequest, StorageUploadResponse, FirebaseStorageService };
