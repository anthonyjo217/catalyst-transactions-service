import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongopaginate from 'mongoose-paginate-v2';

import { Address } from '~core/interfaces/address.interface';
import {
  CustomerLead,
  CustomerLeadHrc,
} from '~core/interfaces/customer-lead.interface';
import { UserModel } from '~core/models/user.model';

import { AddressSchema } from './address.model';
import { CustomerLeadHrcSchema } from './customer-lead-hrc.model';

@Schema({
  versionKey: false,
})
export class CustomerLeadModel extends UserModel implements CustomerLead {
  @Prop()
  gender: string;

  @Prop()
  resultado_de_contacto: string;

  @Prop({ index: true })
  parent_id: string;

  @Prop()
  catalyst_inboxsms_load: boolean;

  @Prop()
  catalyst_phonecall_load: boolean;

  @Prop()
  purchase_type: number;

  @Prop()
  homephone: string;

  @Prop()
  ocupacion: string;

  @Prop()
  first_child_name: string;

  @Prop()
  second_child_name: string;

  @Prop()
  first_child_birthdate: string;

  @Prop()
  second_child_birthdate: string;

  @Prop()
  pinterest: string;

  @Prop()
  twitter: string;

  @Prop()
  birthdate: string;

  @Prop()
  rango_edad: number;

  @Prop()
  time_zone: number;

  @Prop()
  foco_rfm: boolean;

  @Prop()
  startdate: string;

  @Prop()
  unsubscribe: boolean;

  @Prop()
  has_instagram: boolean;

  @Prop()
  old_salesrep: string;

  @Prop()
  consolbalance: string;

  @Prop()
  custentity_plan_elite_inicio: string;

  @Prop()
  tdollars_availables: string;

  @Prop()
  tj_exempt_customer_type: string;

  @Prop()
  datecreated: string;

  @Prop()
  custentity_esc_last_modified_date: string;

  @Prop()
  version: string;

  @Prop()
  subsidiary: string;

  @Prop()
  overduebalance: string;

  @Prop()
  custentity_date_invoicecount_start: string;

  @Prop()
  custentity36: boolean;

  @Prop({
    type: String,
  })
  custentity_resultado_de_contacto_con_cli: any;

  @Prop()
  billaddr1: string;

  @Prop()
  store_name_active: boolean;

  @Prop()
  mitiendatissini_new: boolean;

  @Prop()
  custentity_cmic: string;

  @Prop()
  metas_hace_tres_meses: string;

  @Prop()
  nacionalidad: string;

  @Prop()
  invoice_count: string;

  @Prop()
  salesteamtotal: string;

  @Prop()
  depositbalance: string;

  @Prop()
  planpiloto: boolean;

  @Prop()
  campaigncategory: string;

  @Prop()
  referred_by: string;

  @Prop()
  invoice_amount: string;

  @Prop({ index: true })
  token: string;

  @Prop()
  tj_exempt_customer_states: string;

  @Prop()
  do_not_sale: boolean;

  @Prop()
  shipcity: string;

  @Prop()
  metas_hace_dos_meses: string;

  @Prop()
  hasshippingaddress: boolean;

  @Prop()
  custentity_plan_elite_escalafon: string;

  @Prop()
  leadsource: string;

  @Prop()
  billzip: string;

  @Prop()
  shippingcarrier: string;

  @Prop()
  consoloverduebalance: string;

  @Prop()
  state_restriction_override: boolean;

  @Prop()
  custentity_last_call_date: string;

  @Prop()
  sales_tissiniapp: string;

  @Prop()
  metas_mes_actual: string;

  @Prop()
  tax_exempt: boolean;

  @Prop()
  shipaddr1: string;

  @Prop()
  billaddressee: string;

  @Prop()
  last_call_duration: string;

  @Prop()
  billcity: string;

  @Prop()
  pre_lanzamiento: boolean;

  @Prop({ index: true })
  entitynumber: string;

  @Prop()
  billcountry: string;

  @Prop()
  meses_total_acumulado: string;

  @Prop()
  balance: string;

  @Prop()
  braintree_customer_id: string;

  @Prop()
  has_facebook_account: boolean;

  @Prop()
  metas_mes_anterior: string;

  @Prop()
  birthday: string;

  @Prop()
  instagram: string;

  @Prop()
  phone: string;

  @Prop()
  companyname: string;

  @Prop()
  is_final_client: boolean;

  @Prop()
  shipping_country: string;

  @Prop()
  ytd_invoice_amount: string;

  @Prop()
  isperson: boolean;

  @Prop()
  salesrep: string;

  @Prop()
  promo_level: string;

  @Prop()
  billstate: string;

  @Prop()
  ytd_invoice_count: string;

  @Prop()
  facebook: string;

  @Prop()
  shipzip: string;

  @Prop()
  birthmonth: string;

  @Prop()
  hasbillingaddress: boolean;

  @Prop()
  shipstate: string;

  @Prop()
  salesrep_invoicecount_start: string;

  @Prop()
  unbilledorders: string;

  @Prop()
  birthyear: string;

  @Prop()
  salesrep_startofmonth: string;

  @Prop()
  custentity_fecha_asignacion_ritual: string;

  @Prop()
  ship_to_walgreens: boolean;

  @Prop()
  dream_in_money: string;

  @Prop()
  entitystatus: string;

  @Prop()
  shipaddressee: string;

  @Prop()
  rma_available: boolean;

  @Prop()
  beneficio_market_place: boolean;

  @Prop()
  entitytitle: string;

  @Prop()
  shipcountry: string;

  @Prop()
  beneficio_dias_cambio_ad: boolean;

  @Prop()
  lastmodifieddate: string;

  @Prop()
  communicate_through_sms: boolean;

  @Prop()
  dream: string;

  @Prop()
  hasparent: boolean;

  @Prop()
  sales_mitienda: string;

  @Prop()
  look_entutalla: boolean;

  @Prop()
  monthlyclosing: string;

  @Prop()
  store_name: string;

  @Prop()
  store_enabled?: boolean;

  @Prop()
  last_activity?: string;

  @Prop()
  app_version?: string;

  @Prop()
  browser?: string;

  @Prop()
  salesrep_id: string;

  @Prop({
    type: CustomerLeadHrcSchema,
  })
  hrc: CustomerLeadHrc;

  @Prop({
    type: [AddressSchema],
  })
  addresses: Address[];
}

export const CustomerLeadSchema =
  SchemaFactory.createForClass(CustomerLeadModel);

CustomerLeadSchema.plugin(mongopaginate);
