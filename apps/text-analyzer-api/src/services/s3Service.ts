import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

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

const streamToString = async (stream: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = [];
  return await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', (error) => reject(error));
  });
};

export const getS3ObjectBodyAsString = async (bucket: string, key: string): Promise<string> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error('S3 object body is empty');
  }

  if (typeof response.Body === 'string') {
    return response.Body;
  }

  if (Buffer.isBuffer(response.Body)) {
    return response.Body.toString('utf-8');
  }

  return await streamToString(response.Body as NodeJS.ReadableStream);
};

export const getS3ObjectStream = async (bucket: string, key: string): Promise<NodeJS.ReadableStream> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error('S3 object body is empty');
  }

  if (typeof response.Body === 'string' || Buffer.isBuffer(response.Body)) {
    return Readable.from(response.Body);
  }

  return response.Body as NodeJS.ReadableStream;
};

export const deleteS3Object = async (bucket: string, key: string): Promise<void> => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );
};
