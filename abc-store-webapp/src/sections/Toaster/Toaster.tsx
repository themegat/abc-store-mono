import { Alert, Snackbar } from '@mui/material';

import { useToasterContext } from './ToasterContext';

const Toaster = () => {
  const context = useToasterContext();

  const handleClose = () => {
    context.setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={context.open}
      color="error"
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={context.severity || 'info'} sx={{ width: '100%' }}>
        {context.message}
      </Alert>
    </Snackbar>
  );
};

export default Toaster;
