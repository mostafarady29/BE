const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const EXTENSION_MAP = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.S3_BUCKET_NAME;
const EXPIRY = parseInt(process.env.S3_PRESIGN_EXPIRY || '300', 10);

/**
 * Validate the requested content type.
 * @param {string} contentType
 * @returns {boolean}
 */
const isAllowedMimeType = (contentType) => ALLOWED_MIME_TYPES.includes(contentType);

/**
 * Generate a presigned PUT URL so the client can upload directly to S3.
 * @param {number} postId
 * @param {string} contentType  - Must be in ALLOWED_MIME_TYPES
 * @returns {{ uploadUrl: string, fileKey: string, fileUrl: string }}
 */
const generatePresignedUploadUrl = async (postId, contentType) => {
    if (!isAllowedMimeType(contentType)) {
        throw new Error(`File type "${contentType}" is not allowed.`);
    }

    const ext = EXTENSION_MAP[contentType];
    const fileKey = `posts/${postId}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        ContentType: contentType,
        // Enforce content type on upload — prevents MIME spoofing
        Metadata: { 'post-id': String(postId) },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: EXPIRY });

    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;

    return { uploadUrl, fileKey, fileUrl };
};

/**
 * Delete an object from S3 by its key.
 * @param {string} fileKey
 */
const deleteFile = async (fileKey) => {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey }));
};

module.exports = { generatePresignedUploadUrl, deleteFile, isAllowedMimeType };
