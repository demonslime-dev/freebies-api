import app from '@/app.js';
import logger from '@/shared/logger.js';

const port = process.env.PORT || 80;

app.listen(port, () => logger.info(`Server stated on port: ${port}`));
