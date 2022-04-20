import * as crypto from 'crypto';

export type Params = { [key: string]: string | number | boolean };

export default function generatePasswordUrl(params?: Params) {
  const stringifiedParams = Object.entries(params || {}).reduce(
    (acc, [key, value]) => `${acc}&${key}=${value}`,
    '',
  );

  const token = crypto.randomBytes(64).toString('hex');
  return {
    url: `${process.env.FRONTEND_URL}/reset-password/${token}?${stringifiedParams}`,
    token,
  };
}
