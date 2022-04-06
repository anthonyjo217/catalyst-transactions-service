import { SetMetadata } from '@nestjs/common';

export const API_KEY_KEY = 'apiKey';
export const ApiKey = () => SetMetadata(API_KEY_KEY, true);
