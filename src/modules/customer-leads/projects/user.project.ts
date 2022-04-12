import { CustomerLead } from '~core/interfaces/customer-lead.interface';

export type UserProject = {
  [key in keyof CustomerLead]: number;
};

export const userProject: Partial<UserProject> = {
  _id: 1,
  firstname: 1,
  lastname: 1,
  email: 1,
  mobilephone: 1,
  dream: 1,
  salesrep: 1,
  store_name: 1,
  instagram: 1,
  twitter: 1,
  pinterest: 1,
  facebook: 1,
  time_zone: 1,
  birthdate: 1,
  rango_edad: 1,
  addresses: 1,
  entityid: 1,
  entitytitle: 1,
  entitynumber: 1,
  token: 1,
  salesrep_id: 1,
};
