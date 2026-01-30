export type PresignResponse = {
    uploadUrl: string;
    key: string;
}

export type PresignRequest = {
    fileName: string;
    contentType: string;
    ownerId: string;
    fingerprintHash: string;
};