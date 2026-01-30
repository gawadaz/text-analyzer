import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.UPLOAD_BUCKET_NAME;

export const getS3SignedUrl = async (
  key: string,
  contentType: string,
): Promise<string> => {
  if (!bucketName) {
    throw new Error('Bucket name is not defined in environment variables');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    // ACL: 'public-read' // Uncomment if you want the file to be public immediately (requires Bucket settings)
  });

  // 3. Generate the Pre-signed URL
  // 'expiresIn' defines how long the URL is valid (in seconds). 300 = 5 minutes.
  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
};
