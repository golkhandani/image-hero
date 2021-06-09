// Put shared constants here

export const clearNameRegex = new RegExp(/[^a-zA-Z .]/g);


export const applicationDomain = process.env.APPLICATION_DOMAIN!;
export const applicationName = process.env.APPLICATION_NAME!;
export const applicationPort = process.env.PORT || 3000;

export const minioServer = {
    endpoint: process.env.MINIO_DOMAIN,
    access: process.env.MINIO_ACCESS_KEY,
    secret: process.env.MINIO_SECRET_KEY,
    tls: process.env.MINIO_TLS == "false" ? false : true
};
export const cacheBucketName = process.env.MINIO_CACHE_BUCKET!;

export const databaseUri = process.env.DATABASE_URI!;