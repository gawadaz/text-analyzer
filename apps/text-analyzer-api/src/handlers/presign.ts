import { createHash } from 'crypto';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { z } from 'zod';
import { getS3SignedUrl } from '../services/s3Service';
import { putFileMetadataItem, getFileMetadataItem } from '../services/dynamoDB';

const PresignRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  ownerId: z.string().min(1),
  fingerprintHash: z
    .string()
    
    .min(1)
    .regex(/^[a-f0-9]{64}$/i, 'Invalid fingerprint hash')
});

type PresignRequest = z.infer<typeof PresignRequestSchema>;

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const requestId = context.awsRequestId;
  const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: baseHeaders, body: '' };
    }

    // 1. Parse the request body (assuming the frontend sends JSON)
    if (!event.body) {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ error: { code: 'BadRequest', message: 'Missing body', requestId } })
      };
    }

    let parsedBody: PresignRequest;
    try {
      const rawBody = JSON.parse(event.body) as unknown;
      const parsed = PresignRequestSchema.safeParse(rawBody);
      if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? 'Invalid request body';
        return {
          statusCode: 400,
          headers: baseHeaders,
          body: JSON.stringify({ error: { code: 'BadRequest', message, requestId } })
        };
      }
      parsedBody = parsed.data;
    } catch {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ error: { code: 'BadRequest', message: 'Invalid JSON body', requestId } })
      };
    }

    const { fileName, contentType, ownerId, fingerprintHash } = parsedBody;

    const fileId = createHash('sha256')
      .update(`${ownerId}:${fingerprintHash}`)
      .digest('hex');

    // Check if a file with this fileId already exists and return a conflict
    const existing = await getFileMetadataItem(fileId);
    if (existing) {
      return {
        statusCode: 409,
        headers: baseHeaders,
        body: JSON.stringify({
          error: {
            code: 'Conflict',
            message: 'You already uploaded this file.',
            requestId,
            fileId
          }
        })
      };
    }

    const key = `uploads/${ownerId}/${fileId}-${fileName}`;

    // 3. Generate the Pre-signed URL
    // 'expiresIn' defines how long the URL is valid (in seconds). 300 = 5 minutes.
    const uploadUrl = await getS3SignedUrl(key, contentType);

    try {
      await putFileMetadataItem({
        fileId,
        ownerId,
        s3Bucket: process.env.UPLOAD_BUCKET_NAME || '',
        s3Key: key,
        originalFileName: fileName,
        fingerprintHash
      });
    } catch (error: unknown) {
      if ((error as { name?: string } | undefined)?.name === 'ConditionalCheckFailedException') {
        return {
          statusCode: 409,
          headers: baseHeaders,
          body: JSON.stringify({
            error: {
              code: 'Conflict',
              message: 'You already uploaded this file.',
              requestId,
              fileId
            }
          })
        };
      }
      throw error;
    }

    // 4. Return the URL and the Key (so frontend knows where it ended up)
    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ data: { uploadUrl, key } })
    };

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({
        error: { code: 'InternalError', message: 'Internal Server Error', requestId }
      })
    };
  }
};