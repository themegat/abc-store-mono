import { styled } from '@mui/material/styles';

const Image = styled('img')(({ theme }) => ({
  width: '300px',
  boxSizing: 'border-box',
  padding: theme.spacing(2)
}));

export { Image };
