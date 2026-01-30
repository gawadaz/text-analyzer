// insert new row to dynamoDB table
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// table name from environment variable
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "text-analyzer-history";

export type FileMetadataItemInput = {
  fileId: string;
  ownerId: string;
  s3Bucket: string;
  s3Key: string;
  originalFileName: string;
};

export type AnalysisResult = {
  totalWords: number;
  uniqueWords: number;
  avgWordLength: number;
  top10Words?: Array<{ word: string; count: number }>;
};

export type OwnerHistoryItem = {
  fileId: string;
  ownerId: string;
  s3Bucket: string;
  s3Key: string;
  originalFileName: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: number;
  updatedAt: number;
};

const toResultAttribute = (result: AnalysisResult): AttributeValue => ({
  M: {
    totalWords: { N: String(result.totalWords) },
    uniqueWords: { N: String(result.uniqueWords) },
    avgWordLength: { N: String(result.avgWordLength) },
    ...(result.top10Words
      ? {
          top10Words: {
            L: result.top10Words.map((entry) => ({
              M: {
                word: { S: entry.word },
                count: { N: String(entry.count) }
              }
            }))
          }
        }
      : {})
  }
});

export const putFileMetadataItem = async (input: FileMetadataItemInput): Promise<void> => {
  const now = Date.now();

  await ddbClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: { S: `FILE#${input.fileId}` },
        SK: { S: "META" },

        fileId: { S: input.fileId },
        ownerId: { S: input.ownerId },

        s3Bucket: { S: input.s3Bucket },
        s3Key: { S: input.s3Key },
        originalFileName: { S: input.originalFileName },

        status: { S: "PENDING" },
        createdAt: { N: String(now) },
        updatedAt: { N: String(now) }
      }
    })
  );

  await ddbClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: { S: `OWNER#${input.ownerId}` },
        SK: { S: `FILE#${input.fileId}` },

        fileId: { S: input.fileId },
        ownerId: { S: input.ownerId },

        s3Bucket: { S: input.s3Bucket },
        s3Key: { S: input.s3Key },
        originalFileName: { S: input.originalFileName },

        status: { S: "PENDING" },
        createdAt: { N: String(now) },
        updatedAt: { N: String(now) }
      }
    })
  );
};

export const updateFileMetadataItemStatus = async (
  fileId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
  errorMessage?: string,
  ownerId?: string,
  result?: AnalysisResult
): Promise<void> => {
  const now = Date.now();

  const setExpressions = ["#status = :status", "updatedAt = :updatedAt"];
  const removeExpressions: string[] = [];
  const expressionAttributeValues: Record<string, AttributeValue> = {
    ":status": { S: status },
    ":updatedAt": { N: String(now) }
  };

  if (errorMessage) {
    setExpressions.push("errorMessage = :errorMessage");
    expressionAttributeValues[":errorMessage"] = { S: errorMessage };
  } else {
    removeExpressions.push("errorMessage");
  }

  if (result) {
    setExpressions.push("result = :result");
    expressionAttributeValues[":result"] = toResultAttribute(result);
  }

  const updateExpression = `SET ${setExpressions.join(", ")}${
    removeExpressions.length ? ` REMOVE ${removeExpressions.join(", ")}` : ""
  }`;

  await ddbClient.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `FILE#${fileId}` },
        SK: { S: "META" }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: expressionAttributeValues
    })
  );

  if (!ownerId) {
    return;
  }

  const ownerSetExpressions = ["#status = :status", "updatedAt = :updatedAt"];
  const ownerRemoveExpressions: string[] = [];
  const ownerExpressionAttributeValues: Record<string, AttributeValue> = {
    ":status": { S: status },
    ":updatedAt": { N: String(now) }
  };

  if (errorMessage) {
    ownerSetExpressions.push("errorMessage = :errorMessage");
    ownerExpressionAttributeValues[":errorMessage"] = { S: errorMessage };
  } else {
    ownerRemoveExpressions.push("errorMessage");
  }

  const ownerUpdateExpression = `SET ${ownerSetExpressions.join(", ")}${
    ownerRemoveExpressions.length ? ` REMOVE ${ownerRemoveExpressions.join(", ")}` : ""
  }`;

  await ddbClient.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `OWNER#${ownerId}` },
        SK: { S: `FILE#${fileId}` }
      },
      UpdateExpression: ownerUpdateExpression,
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: ownerExpressionAttributeValues
    })
  );
};

const getString = (value: { S?: string } | undefined): string | undefined => value?.S;
const getNumber = (value: { N?: string } | undefined): number | undefined =>
  value?.N ? Number(value.N) : undefined;

export const listOwnerHistoryItems = async (ownerId: string): Promise<OwnerHistoryItem[]> => {
  const result = await ddbClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: `OWNER#${ownerId}` }
      }
    })
  );

  const items = result.Items ?? [];
  return items
    .map((item) => {
      const fileId = getString(item.fileId as { S?: string } | undefined);
      const ownerIdValue = getString(item.ownerId as { S?: string } | undefined);
      const s3Bucket = getString(item.s3Bucket as { S?: string } | undefined);
      const s3Key = getString(item.s3Key as { S?: string } | undefined);
      const originalFileName = getString(item.originalFileName as { S?: string } | undefined);
      const status = getString(item.status as { S?: string } | undefined);
      const createdAt = getNumber(item.createdAt as { N?: string } | undefined);
      const updatedAt = getNumber(item.updatedAt as { N?: string } | undefined);

      if (!fileId || !ownerIdValue || !s3Bucket || !s3Key || !originalFileName || !status || !createdAt || !updatedAt) {
        return undefined;
      }

      return {
        fileId,
        ownerId: ownerIdValue,
        s3Bucket,
        s3Key,
        originalFileName,
        status: status as OwnerHistoryItem["status"],
        createdAt,
        updatedAt
      };
    })
    .filter((item): item is OwnerHistoryItem => Boolean(item));
};


