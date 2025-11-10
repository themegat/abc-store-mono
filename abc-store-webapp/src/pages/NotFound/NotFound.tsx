import { Stack, SxProps, Typography } from '@mui/material';

import noItemFoundIcon from '../../assets/no_item_found.png';
import { Image } from './styled';

type Props = {
  title: string;
  sx?: SxProps;
};
const NotFound = ({ title, sx }: Props) => {
  return (
    <Stack sx={sx} textAlign="center">
      <Image src={noItemFoundIcon} alt={title} />
      <Typography variant="h4">{title}</Typography>
    </Stack>
  );
};

export default NotFound;
