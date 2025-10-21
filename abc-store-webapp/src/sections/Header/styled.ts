import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const HotKeysButton = styled(Button)(({ theme }) => ({
  height: 'fit-content',
  alignSelf: 'center',
  marginRight: theme.spacing(1),
  borderColor: theme.palette.text.disabled,
  '&:hover': {
    borderColor: theme.palette.text.disabled,
  },
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

export { HotKeysButton };
