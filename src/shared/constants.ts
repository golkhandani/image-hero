// Put shared constants here

import { AdapterType, initObjectStoreClient } from "@relaycorp/object-storage";
import * as multer from "multer";


export const domain = "3000/image"
export const clearNameRegex = new RegExp(/[^a-zA-Z .]/g);

export const cacheBucketName = 'cache';

export const applicationName = "ImageHero";

export const minioServer = {
    endpoint: "http://localhost:9000",
    access: "minio-access-key",
    secret: "minio-secret-key",
};

export const s3Client = initObjectStoreClient(
    "minio" as AdapterType,
    minioServer.endpoint,
    minioServer.access,
    minioServer.secret,
    false
);




export const uploaderMemoryStorage = multer.memoryStorage();
const uploaderOptions: multer.Options = {
    storage: uploaderMemoryStorage
};

export const uploader = multer.default(uploaderOptions);
