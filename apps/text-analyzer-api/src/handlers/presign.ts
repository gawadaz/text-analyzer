import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize the client outside the handler to take advantage of execution context reuse
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // 1. Parse the request body (assuming the frontend sends JSON)
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }
    
    const { fileName, fileType } = JSON.parse(event.body);

    if (!fileName || !fileType) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing fileName or fileType' }) };
    }

    // 2. Define the S3 parameters
    const bucketName = process.env.UPLOAD_BUCKET_NAME;
    const key = `uploads/${Date.now()}-${fileName}`; // Add timestamp to prevent overwrites

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType, 
      // ACL: 'public-read' // Uncomment if you want the file to be public immediately (requires Bucket settings)
    });

    // 3. Generate the Pre-signed URL
    // 'expiresIn' defines how long the URL is valid (in seconds). 300 = 5 minutes.
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // 4. Return the URL and the Key (so frontend knows where it ended up)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        uploadUrl,
        key
      }),
    };

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: String(error) }),
    };
  }
};