import { CustomerLead } from '~core/interfaces/customer-lead.interface';

export const userProject: MongoProject<CustomerLead> = {
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
  nacionalidad: 1,
  ocupacion: 1,
  first_child_birthdate: 1,
  first_child_name: 1,
  second_child_birthdate: 1,
  second_child_name: 1,
  custentity_resultado_de_contacto_con_cli: 1,
  companyname: 1,
  homephone: 1,
  dream_in_money: 1,
  datecreated: 1,
  phone: 1,
  stage: 1,
  purchase_type: 1,
  rma_available: 1,
  state_restriction_override: 1,
  leadsource: 1,
  referred_by: 1,
  catalyst_inboxsms_load: 1,
  catalyst_phonecall_load: 1,
  metas_hace_dos_meses: 1,
  metas_hace_tres_meses: 1,
  metas_mes_actual: 1,
  meses_total_acumulado: 1,
  metas_mes_anterior: 1,
  ship_to_walgreens: 1,
  balance: 1,
};

export type MongoProject<T> = {
  [key in keyof T]?: T[key] extends string | number | boolean
    ? number
    : T[key] extends Array<infer U>
    ? MongoProject<U> | number
    : MongoProject<T[key]> | number;
};
