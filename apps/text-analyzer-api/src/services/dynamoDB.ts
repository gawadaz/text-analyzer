// insert new row to dynamoDB table
import {
  AttributeValue,
  DynamoDBClient,
  DeleteItemCommand,
  GetItemCommand,
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
  fingerprintHash: string;
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
  fingerprintHash?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: number;
  updatedAt: number;
  result?: AnalysisResult;
  errorMessage?: string;
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
        fingerprintHash: { S: input.fingerprintHash },

        status: { S: "PENDING" },
        createdAt: { N: String(now) },
        updatedAt: { N: String(now) }
      },
      ConditionExpression: "attribute_not_exists(PK)"
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
        fingerprintHash: { S: input.fingerprintHash },

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
    setExpressions.push("#errorMessage = :errorMessage");
    expressionAttributeValues[":errorMessage"] = { S: errorMessage };
  } else {
    removeExpressions.push("#errorMessage");
  }

  if (result) {
    setExpressions.push("#result = :result");
    expressionAttributeValues[":result"] = toResultAttribute(result);
  } else {
    removeExpressions.push("#result");
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
        "#status": "status",
        "#errorMessage": "errorMessage",
        "#result": "result"
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
    ownerSetExpressions.push("#errorMessage = :errorMessage");
    ownerExpressionAttributeValues[":errorMessage"] = { S: errorMessage };
  } else {
    ownerRemoveExpressions.push("#errorMessage");
  }

  if (result) {
    ownerSetExpressions.push("#result = :result");
    ownerExpressionAttributeValues[":result"] = toResultAttribute(result);
  } else {
    ownerRemoveExpressions.push("#result");
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
        "#status": "status",
        "#errorMessage": "errorMessage",
        "#result": "result"
      },
      ExpressionAttributeValues: ownerExpressionAttributeValues
    })
  );
};

const getString = (value: { S?: string } | undefined): string | undefined => value?.S;
const getNumber = (value: { N?: string } | undefined): number | undefined =>
  value?.N ? Number(value.N) : undefined;

const getResult = (value: AttributeValue | undefined): AnalysisResult | undefined => {
  if (!value || !('M' in value) || !value.M) {
    return undefined;
  }

  const map = value.M;
  const totalWords = getNumber(map.totalWords as { N?: string } | undefined);
  const uniqueWords = getNumber(map.uniqueWords as { N?: string } | undefined);
  const avgWordLength = getNumber(map.avgWordLength as { N?: string } | undefined);

  if (totalWords === undefined || uniqueWords === undefined || avgWordLength === undefined) {
    return undefined;
  }

  const top10WordsValue = map.top10Words as AttributeValue | undefined;
  const top10Words =
    top10WordsValue && 'L' in top10WordsValue && top10WordsValue.L
      ? top10WordsValue.L
          .map((entry) => {
            if (!entry || !('M' in entry) || !entry.M) {
              return undefined;
            }
            const word = getString(entry.M.word as { S?: string } | undefined);
            const count = getNumber(entry.M.count as { N?: string } | undefined);
            if (!word || count === undefined) {
              return undefined;
            }
            return { word, count };
          })
          .filter((entry): entry is { word: string; count: number } => Boolean(entry))
      : undefined;

  return {
    totalWords,
    uniqueWords,
    avgWordLength,
    ...(top10Words ? { top10Words } : {})
  };
};

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
      const fingerprintHash = getString(item.fingerprintHash as { S?: string } | undefined);
      const status = getString(item.status as { S?: string } | undefined);
      const createdAt = getNumber(item.createdAt as { N?: string } | undefined);
      const updatedAt = getNumber(item.updatedAt as { N?: string } | undefined);
      const errorMessage = getString(item.errorMessage as { S?: string } | undefined);
      const result = getResult(item.result as AttributeValue | undefined);

      if (!fileId || !ownerIdValue || !s3Bucket || !s3Key || !originalFileName || !status || !createdAt || !updatedAt) {
        return undefined;
      }

      const baseItem: OwnerHistoryItem = {
        fileId,
        ownerId: ownerIdValue,
        s3Bucket,
        s3Key,
        originalFileName,
        status: status as OwnerHistoryItem["status"],
        createdAt,
        updatedAt
      };

      if (fingerprintHash) {
        baseItem.fingerprintHash = fingerprintHash;
      }

      if (errorMessage) {
        baseItem.errorMessage = errorMessage;
      }

      if (result) {
        baseItem.result = result;
      }

      return baseItem;
    })
    .filter((item): item is OwnerHistoryItem => Boolean(item));
};

export const getFileMetadataItem = async (fileId: string): Promise<OwnerHistoryItem | undefined> => {
  const result = await ddbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `FILE#${fileId}` },
        SK: { S: "META" }
      }
    })
  );

  const item = result.Item;
  if (!item) {
    return undefined;
  }

  const fileIdValue = getString(item.fileId as { S?: string } | undefined);
  const ownerIdValue = getString(item.ownerId as { S?: string } | undefined);
  const s3Bucket = getString(item.s3Bucket as { S?: string } | undefined);
  const s3Key = getString(item.s3Key as { S?: string } | undefined);
  const originalFileName = getString(item.originalFileName as { S?: string } | undefined);
  const fingerprintHash = getString(item.fingerprintHash as { S?: string } | undefined);
  const status = getString(item.status as { S?: string } | undefined);
  const createdAt = getNumber(item.createdAt as { N?: string } | undefined);
  const updatedAt = getNumber(item.updatedAt as { N?: string } | undefined);
  const errorMessage = getString(item.errorMessage as { S?: string } | undefined);
  const resultValue = getResult(item.result as AttributeValue | undefined);

  if (!fileIdValue || !ownerIdValue || !s3Bucket || !s3Key || !originalFileName || !status || !createdAt || !updatedAt) {
    return undefined;
  }

  const baseItem: OwnerHistoryItem = {
    fileId: fileIdValue,
    ownerId: ownerIdValue,
    s3Bucket,
    s3Key,
    originalFileName,
    status: status as OwnerHistoryItem["status"],
    createdAt,
    updatedAt
  };

  if (fingerprintHash) {
    baseItem.fingerprintHash = fingerprintHash;
  }

  if (errorMessage) {
    baseItem.errorMessage = errorMessage;
  }

  if (resultValue) {
    baseItem.result = resultValue;
  }

  return baseItem;
};

export const markFileProcessingInProgress = async (fileId: string, ownerId: string): Promise<boolean> => {
  const now = Date.now();

  try {
    await ddbClient.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: { S: `FILE#${fileId}` },
          SK: { S: "META" }
        },
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt REMOVE #errorMessage, #result",
        ConditionExpression: "#status = :pending OR #status = :failed",
        ExpressionAttributeNames: {
          "#status": "status",
          "#errorMessage": "errorMessage",
          "#result": "result"
        },
        ExpressionAttributeValues: {
          ":status": { S: "IN_PROGRESS" },
          ":updatedAt": { N: String(now) },
          ":pending": { S: "PENDING" },
          ":failed": { S: "FAILED" }
        }
      })
    );
  } catch (error: unknown) {
    if ((error as { name?: string } | undefined)?.name === "ConditionalCheckFailedException") {
      return false;
    }
    throw error;
  }

  await ddbClient.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `OWNER#${ownerId}` },
        SK: { S: `FILE#${fileId}` }
      },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt REMOVE #errorMessage, #result",
      ExpressionAttributeNames: {
        "#status": "status",
        "#errorMessage": "errorMessage",
        "#result": "result"
      },
      ExpressionAttributeValues: {
        ":status": { S: "IN_PROGRESS" },
        ":updatedAt": { N: String(now) }
      }
    })
  );

  return true;
};

export const deleteFileItems = async (fileId: string, ownerId: string): Promise<void> => {
  await ddbClient.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `FILE#${fileId}` },
        SK: { S: "META" }
      }
    })
  );

  await ddbClient.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `OWNER#${ownerId}` },
        SK: { S: `FILE#${fileId}` }
      }
    })
  );
};


