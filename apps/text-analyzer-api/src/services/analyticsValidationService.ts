import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

export type ValidationResult =
  | { ok: true; ownerId: string }
  | { ok: false; response: { statusCode: number; headers: Record<string, string | number | boolean>; body: string } };

export type DeleteValidationResult =
  | { ok: true; ownerId: string; fileId: string }
  | { ok: false; response: { statusCode: number; headers: Record<string, string | number | boolean>; body: string } };

const getHeaderValue = (
  headers: Record<string, string | undefined> | null | undefined,
  name: string
): string | undefined => {
  if (!headers) {
    return undefined;
  }

  const direct = headers[name];
  if (direct) {
    return direct;
  }

  const normalized = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === normalized) {
      return value;
    }
  }

  return undefined;
};

export const validateAnalyticsRequest = (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  requestId: string,
  baseHeaders: Record<string, string | number | boolean>
): ValidationResult => {
  const method = 'httpMethod' in event ? event.httpMethod : event.requestContext?.http?.method;

  if (method === 'OPTIONS') {
    return { ok: false, response: { statusCode: 204, headers: baseHeaders, body: '' } };
  }

  if (method !== 'GET') {
    return {
      ok: false,
      response: {
        statusCode: 405,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'MethodNotAllowed', message: 'Method not allowed', requestId }
        })
      }
    };
  }

  const ownerIdFromPath = event.pathParameters?.ownerId ?? undefined;
  if (!ownerIdFromPath) {
    return {
      ok: false,
      response: {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'BadRequest', message: 'Missing ownerId in path', requestId }
        })
      }
    };
  }

  const ownerIdHeader = getHeaderValue(event.headers ?? null, 'X-Owner-Id');
  if (!ownerIdHeader) {
    return {
      ok: false,
      response: {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'BadRequest', message: 'Missing X-Owner-Id header', requestId }
        })
      }
    };
  }

  if (ownerIdHeader !== ownerIdFromPath) {
    return {
      ok: false,
      response: {
        statusCode: 403,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'Forbidden', message: 'OwnerId mismatch', requestId }
        })
      }
    };
  }

  return { ok: true, ownerId: ownerIdHeader };
};

export const validateAnalyticsDeleteRequest = (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  requestId: string,
  baseHeaders: Record<string, string | number | boolean>
): DeleteValidationResult => {
  const method = 'httpMethod' in event ? event.httpMethod : event.requestContext?.http?.method;

  if (method === 'OPTIONS') {
    return { ok: false, response: { statusCode: 204, headers: baseHeaders, body: '' } };
  }

  if (method !== 'DELETE') {
    return {
      ok: false,
      response: {
        statusCode: 405,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'MethodNotAllowed', message: 'Method not allowed', requestId }
        })
      }
    };
  }

  const fileId = event.pathParameters?.fileId ?? undefined;
  if (!fileId) {
    return {
      ok: false,
      response: {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'BadRequest', message: 'Missing fileId in path', requestId }
        })
      }
    };
  }

  const ownerIdHeader = getHeaderValue(event.headers ?? null, 'X-Owner-Id');
  if (!ownerIdHeader) {
    return {
      ok: false,
      response: {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({
          error: { code: 'BadRequest', message: 'Missing X-Owner-Id header', requestId }
        })
      }
    };
  }

  return { ok: true, ownerId: ownerIdHeader, fileId };
};
