import { APIGatewayProxyHandler } from 'aws-lambda';
import { getOwnerAnalytics } from '../services/analyticsService';
import { validateAnalyticsRequest } from '../services/analyticsValidationService';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const requestId = context.awsRequestId;
  const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Owner-Id',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    const validation = validateAnalyticsRequest(event, requestId, baseHeaders);
    if (!validation.ok) {
      return validation.response;
    }

    const items = await getOwnerAnalytics(validation.ownerId);

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify(items)
    };
  } catch (error) {
    console.error('Error fetching analytics history:', error);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({
        error: { code: 'InternalError', message: 'Internal Server Error', requestId }
      })
    };
  }
};
