import { useState } from 'react';

const useToaster = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState<'info' | 'success' | 'warning' | 'error' | undefined>(
    undefined,
  );

  return { open, setOpen, message, setMessage, severity, setSeverity };
};

export default useToaster;
