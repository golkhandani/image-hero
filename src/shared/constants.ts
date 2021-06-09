// Put shared constants here

import { AdapterType, initObjectStoreClient } from "@relaycorp/object-storage";
import * as multer from "multer";


export const domain = "http://localhost:3000";
export const clearNameRegex = new RegExp(/[^a-zA-Z .]/g);

export const cacheBucketName = 'cache';

export const applicationName = "ImageHero";

export const minioServer = {
    endpoint: "http://localhost:9000",
    access: "minio-access-key",
    secret: "minio-secret-key",
    tls: false
};
