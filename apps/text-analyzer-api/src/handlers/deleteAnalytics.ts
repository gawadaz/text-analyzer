import { APIGatewayProxyHandler } from 'aws-lambda';
import { deleteFileItems, getFileMetadataItem } from '../services/dynamoDB';
import { deleteS3Object } from '../services/s3Service';
import { validateAnalyticsDeleteRequest } from '../services/analyticsValidationService';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const requestId = context.awsRequestId;
  const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Owner-Id',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    const validation = validateAnalyticsDeleteRequest(event, requestId, baseHeaders);
    if (!validation.ok) {
      return validation.response;
    }

    const fileItem = await getFileMetadataItem(validation.fileId);
    if (!fileItem) {
      return {
        statusCode: 204,
        headers: baseHeaders,
        body: ''
      };
    }

    if (fileItem.ownerId !== validation.ownerId) {
      return {
        statusCode: 403,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'Forbidden', message: 'OwnerId mismatch', requestId }
        })
      };
    }

    await deleteS3Object(fileItem.s3Bucket, fileItem.s3Key);
    await deleteFileItems(validation.fileId, validation.ownerId);

    return {
      statusCode: 204,
      headers: baseHeaders,
      body: ''
    };
  } catch (error) {
    console.error('Error deleting analytics file:', error);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({
        error: { code: 'InternalError', message: 'Internal Server Error', requestId }
      })
    };
  }
};
