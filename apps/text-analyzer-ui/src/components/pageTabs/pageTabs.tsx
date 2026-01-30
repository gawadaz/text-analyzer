import { Button, ButtonGroup } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

type PageTabsProps = {
  active: 'upload' | 'history';
};

export function PageTabs({ active }: PageTabsProps) {
  return (
    <ButtonGroup
      isAttached
      size="sm"
      variant="outline"
      colorScheme="gray"
      aria-label="Page navigation"
    >
      <Button
        as={RouterLink}
        to="/"
        variant={active === 'upload' ? 'solid' : 'outline'}
        colorScheme={active === 'upload' ? 'blue' : 'gray'}
        aria-current={active === 'upload' ? 'page' : undefined}
      >
        Upload
      </Button>
      <Button
        as={RouterLink}
        to="/history"
        variant={active === 'history' ? 'solid' : 'outline'}
        colorScheme={active === 'history' ? 'blue' : 'gray'}
        aria-current={active === 'history' ? 'page' : undefined}
      >
        History
      </Button>
    </ButtonGroup>
  );
}

export default PageTabs;
