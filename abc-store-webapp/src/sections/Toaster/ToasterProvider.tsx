import { ReactNode } from 'react';

import { ToasterContext } from './ToasterContext';
import useToaster from './useToaster';

const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const toaster = useToaster();
  return <ToasterContext.Provider value={toaster}>{children}</ToasterContext.Provider>;
};

export default ToasterProvider;
