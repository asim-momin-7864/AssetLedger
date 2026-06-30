//* zod config file

import * as z from 'zod';
import { createErrorMap } from 'zod-validation-error';

// gloabl error map for every z schema by zod-validation-errors
z.config({
  customError: createErrorMap(),
});
