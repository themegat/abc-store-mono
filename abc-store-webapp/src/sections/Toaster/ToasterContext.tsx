import { createContext, useContext } from 'react';

interface ToasterContextType {
  open: boolean;
  message?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  setOpen: (open: boolean) => void;
  setMessage: (message: string) => void;
  setSeverity: (severity: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ToasterContext = createContext<ToasterContextType>({
  open: false,
  message: '',
  severity: 'info',
  setOpen: () => {},
  setMessage: () => {},
  setSeverity: () => {},
});

export const useToasterContext = () => {
  return useContext(ToasterContext);
};
