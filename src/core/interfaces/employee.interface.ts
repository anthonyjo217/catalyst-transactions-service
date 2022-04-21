import { User } from './user.interface';

export interface Employee extends User {
  queue_id_8x8: string;
  id_8x8: string;
  password?: string;
  is_logged_in?: boolean;
}
