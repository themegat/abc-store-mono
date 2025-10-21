import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

interface StorageUploadRequest {
  filename: string;
  buffer: Buffer<ArrayBufferLike>;
  contentType: string;
}

interface StorageUploadResponse {
  url: string;
}

class FirebaseStorageService {
  private readonly storage;
  constructor() {
    this.storage = getStorage();
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
