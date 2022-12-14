import { Address } from './address.interface';
import { User } from './user.interface';

export interface CustomerLead extends User {
  gender: string;
  resultado_de_contacto: string;
  parent_id: string;
  foco_rfm: boolean;
  startdate: string;
  unsubscribe: boolean;
  has_instagram: boolean;
  old_salesrep: string;
  consolbalance: string;
  custentity_plan_elite_inicio: string;
  tdollars_availables: string;
  tj_exempt_customer_type: string;
  datecreated: string;
  custentity_esc_last_modified_date: string;
  version: string;
  subsidiary: string;
  overduebalance: string;
  custentity_date_invoicecount_start: string;
  custentity36: boolean;
  custentity_resultado_de_contacto_con_cli: any;
  billaddr1: string;
  store_name_active: boolean;
  mitiendatissini_new: boolean;
  custentity_cmic: string;
  metas_hace_tres_meses: string;
  nacionalidad: string;
  invoice_count: string;
  salesteamtotal: string;
  depositbalance: string;
  planpiloto: boolean;
  campaigncategory: string;
  stage: string;
  referred_by: string;
  invoice_amount: string;
  token: string;
  tj_exempt_customer_states: string;
  do_not_sale: boolean;
  shipcity: string;
  metas_hace_dos_meses: string;
  hasshippingaddress: boolean;
  custentity_plan_elite_escalafon: string;
  leadsource: string;
  billzip: string;
  shippingcarrier: string;
  consoloverduebalance: string;
  state_restriction_override: boolean;
  custentity_last_call_date: string;
  sales_tissiniapp: string;
  metas_mes_actual: string;
  tax_exempt: boolean;
  shipaddr1: string;
  billaddressee: string;
  last_call_duration: string;
  billcity: string;
  pre_lanzamiento: boolean;
  entitynumber: string;
  billcountry: string;
  meses_total_acumulado: string;
  balance: string;
  braintree_customer_id: string;
  has_facebook_account: boolean;
  birthdate: string;
  metas_mes_anterior: string;
  birthday: string;
  instagram: string;
  phone: string;
  companyname: string;
  is_final_client: boolean;
  shipping_country: string;
  ytd_invoice_amount: string;
  isperson: boolean;
  salesrep: string;
  promo_level: string;
  billstate: string;
  ytd_invoice_count: string;
  facebook: string;
  shipzip: string;
  birthmonth: string;
  hasbillingaddress: boolean;
  shipstate: string;
  salesrep_invoicecount_start: string;
  unbilledorders: string;
  birthyear: string;
  salesrep_startofmonth: string;
  isinactive: boolean;
  custentity_fecha_asignacion_ritual: string;
  ship_to_walgreens: boolean;
  dream_in_money: string;
  entitystatus: string;
  shipaddressee: string;
  rma_available: boolean;
  beneficio_market_place: boolean;
  entitytitle: string;
  shipcountry: string;
  beneficio_dias_cambio_ad: boolean;
  lastmodifieddate: string;
  communicate_through_sms: boolean;
  dream: string;
  hasparent: boolean;
  sales_mitienda: string;
  look_entutalla: boolean;
  monthlyclosing: string;
  store_name: string;
  store_enabled?: boolean;
  last_activity?: string;
  app_version?: string;
  browser?: string;
  salesrep_id: string;
  hrc: CustomerLeadHrc;
  addresses: Address[];
  pinterest: string;
  twitter: string;
  rango_edad: number;
  time_zone: number;
  purchase_type: number;
  homephone: string;
  ocupacion: string;
  first_child_name: string;
  second_child_name: string;
  first_child_birthdate: string;
  second_child_birthdate: string;
  catalyst_inboxsms_load: boolean;
  catalyst_phonecall_load: boolean;
}

export interface CustomerLeadHrc {
  compra10_lleva11_lila: boolean;
  acumuladas_rosa: boolean;
  acumuladas_magenta: boolean;
  acumuladas_lila: boolean;
  transicion_elite_a_plus: boolean;
  caminocreado: boolean;
  tcoins_ganados: number;
  tcoins_disponibles: number;
  tcoins_gastados: number;
  tcoins_perdidos: number;
  realiza3compras_celeste: boolean;
  beneficio_dev_pref_talla: boolean;
  reconocimiento_azul: boolean;
  envio_gratis_25_descuento: boolean;
  smarthphone_ult_gen: boolean;
  realiza3compras_magenta: boolean;
  realiza3compras_azul: boolean;
  obsequio_tarjetas_tissini: boolean;
  obsequio_poster_publi: boolean;
  beneficio_atencion_pref: boolean;
  descue_primera_azul: boolean;
  descue_primera_compra_mes: boolean;
  compra10_lleva11: boolean;
  descue_primera_lila: boolean;
  kit_basico_redes: boolean;
  realiza3compras_lila: boolean;
  dos_tiquets_aereos_nacional: boolean;
  reconocimiento_rosa: boolean;
  feria_emprendimiento: boolean;
  reconocimiento_turquesa: boolean;
  kit_personalizado_boutiqu: boolean;
  realiza3compras: boolean;
  reconocimiento_magenta: boolean;
  compra10_lleva11_rosa: boolean;
  pagina_web_perso: boolean;
  realiza3compras_rosa: boolean;
  descue_primera_rosa: boolean;
  reconocimiento_lila: boolean;
  descue_primera_celeste: boolean;
  beneficio_regalo_cumple: boolean;
  beneficio_mentor_person: boolean;
  beneficio_primera_catalog: boolean;
  descue_primera_turquesa: boolean;
  reconocimiento_mejor: boolean;
  beneficio_tissini_academi: boolean;
  dos_tiquets_aereos_intern: boolean;
  beneficio_tissini_pref: boolean;
  publicidad_pagina_persona: boolean;
  reconocimiento_celeste: boolean;
  customer_insignia: string;
  beneficio_conv_grant: boolean;
  kit_premium_redes: boolean;
  descue_primera_magenta: boolean;
  compra10_lleva11_magenta: boolean;
  beneficio_market_place: boolean;
  beneficio_dias_cambio_ad: boolean;
  look_entutalla: boolean;
  obsequio_pancarta_publi: boolean;
}
