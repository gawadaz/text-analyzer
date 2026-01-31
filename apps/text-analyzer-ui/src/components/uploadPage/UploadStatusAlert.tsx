import { Box } from '@chakra-ui/react';
import { UploadErrorAlert } from './UploadErrorAlert';
import { UploadSuccessAlert } from './UploadSuccessAlert';

type Props = {
  errorMessage: string;
  errorTitle: string;
  errorDescription: string;
  lastUploadedFileName: string | null;
  isSuccess: boolean;
  isBusy: boolean;
  onChooseDifferent: () => void;
};

export function UploadStatusAlert({
  errorMessage,
  errorTitle,
  errorDescription,
  lastUploadedFileName,
  isSuccess,
  isBusy,
  onChooseDifferent,
}: Props) {
  if (!errorMessage && !isSuccess) {
    return null;
  }

  return (
    <Box as="section" aria-live="polite">
      <UploadErrorAlert
        errorMessage={errorMessage}
        errorTitle={errorTitle}
        errorDescription={errorDescription}
        isBusy={isBusy}
        onChooseDifferent={onChooseDifferent}
      />
      <UploadSuccessAlert
        lastUploadedFileName={lastUploadedFileName}
        isSuccess={isSuccess && !errorMessage}
      />
    </Box>
  );
}

export default UploadStatusAlert;
