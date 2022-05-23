import { Expose, plainToClass, Transform } from 'class-transformer';
import {
  Allow,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Address } from '~core/interfaces/address.interface';

export enum USER_TYPES {
  LEAD = 'LEAD',
  CUSTOMER = 'CUSTOMER',
  SALESREP = 'EMPLOYEE',
}

/**
 * Estas clase son bastante dificil de explicar y mantener, pero es la que nos permite
 * convertir un objeto de tipo User de NetSuite a un objeto de tipo User de nuestro
 * sistema.
 *
 * Hay propiedades que no se pueden convertir directamente porque su valor es una
 * letra que representan un valor booleano en NetSuite (T y F).
 *
 * Para convertir estas propiedades hay que usar una función de transformación
 * que convierte la letra en un valor booleano.
 *
 */

export class AddressLine {
  @IsString()
  @Transform(({ value }) => Number(value))
  id: number;

  @Transform(({ obj }) => obj['isresidential'] === 'T')
  @Expose({ name: 'isresidential' })
  isresidential: boolean;

  @Transform(({ obj }) => obj['defaultbilling'] === 'T')
  @Expose({ name: 'defaultbilling' })
  defaultbilling: boolean;

  @Transform(({ obj }) => obj['defaultshipping'] === 'T')
  @Expose({ name: 'defaultshipping' })
  defaultshipping: boolean;

  @IsOptional()
  @Expose({ name: 'addr1_initialvalue' })
  address: string;

  @IsOptional()
  @Expose({ name: 'addr2_initialvalue' })
  address_2: string;

  @IsOptional()
  @Expose({ name: 'addr3_initialvalue' })
  address_3: string;

  @IsOptional()
  @Expose({ name: 'addressbookaddress_key' })
  key: string;

  @IsOptional()
  @Expose({ name: 'addressee_initialvalue' })
  addresse: string;

  @IsOptional()
  @Expose({ name: 'city_initialvalue' })
  city: string;

  @IsOptional()
  @Expose({ name: 'country_initialvalue' })
  country: string;

  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  @Expose({ name: 'phone_initialvalue' })
  phone: string;

  @IsOptional()
  @Expose({ name: 'state_initialvalue' })
  state: string;

  @IsOptional()
  @Expose({ name: 'zip_initialvalue' })
  zipcode: string;
}

export class SaleTeamLine {
  contribution: string;

  @Transform(({ value }) => value)
  customer: string;

  @Transform(({ value }) => value)
  employee: string;

  employee_display: string;
  id: string;

  @Transform(({ obj }) => obj['isprimary'] === 'T')
  @Expose({ name: 'isprimary' })
  isprimary: boolean;

  @Transform(({ obj }) => obj['issalesrep'] === 'T')
  @Expose({ name: 'issalesrep' })
  issalesrep: boolean;

  @Transform(({ value }) => value)
  salesrole: string;
}

export class SaleTeam {
  currentline: SaleTeamLine;
  [key: string]: SaleTeamLine;
}

export class Sublists {
  @IsObject()
  @Transform(({ value }) => {
    const keys = Object.keys(value).filter((key) => key !== 'currentline');
    return keys.map((key) => {
      const addressBook = plainToClass(AddressLine, value[key]);
      return {
        ...addressBook,
        _id: addressBook.id,
      };
    });
  })
  addressbook: Address[];

  @IsObject()
  salesteam: SaleTeam;
}

export class EmployeeFields {
  @Transform(({ value }) => value)
  @Expose({ name: 'custentity8x8_queue_id' })
  queue_id_8x8: string;

  @Expose({ name: 'custentity_8x8_id' })
  id_8x8: string;
}

export class Fields extends EmployeeFields {
  @Transform(({ obj }) => {
    const parsed = Number(obj['custentity_hrc_total_tcoins_ganados']);
    return isNaN(parsed) ? 0 : parsed;
  })
  @Expose({ name: 'custentity_hrc_total_tcoins_ganados' })
  tcoins_ganados: number;

  @Transform(({ obj }) => {
    const parsed = Number(obj['custentity_hrc_tcoins_disponibles']);
    return isNaN(parsed) ? 0 : parsed;
  })
  tcoins_disponibles: number;

  @Transform(({ obj }) => {
    const parsed = Number(obj['custentity_hrc_tcoins_gastados']);
    return isNaN(parsed) ? 0 : parsed;
  })
  tcoins_gastados: number;

  @Transform(({ obj }) => {
    const parsed = Number(obj['custentity_hrc_tcoins_perdidos']);
    return isNaN(parsed) ? 0 : parsed;
  })
  tcoins_perdidos: number;

  @Transform(({ obj }) => obj['custentity_hrc_realiza3compras_celeste'] === 'T')
  @Expose({ name: 'custentity_hrc_realiza3compras_celeste' })
  realiza3compras_celeste: boolean;

  @Transform(
    ({ obj }) => obj['custentity_hrc_beneficio_dev_pref_talla'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_beneficio_dev_pref_talla' })
  beneficio_dev_pref_talla: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_azul'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_azul' })
  reconocimiento_azul: boolean;

  @Transform(({ obj }) => obj['custentity_foco_rfm'] === 'T')
  @Expose({ name: 'custentity_foco_rfm' })
  foco_rfm: boolean;

  // TODO transform to valid date format
  startdate: string;

  @Transform(({ obj }) => obj['unsubscribe'] === 'T')
  @Expose({ name: 'unsubscribe' })
  unsubscribe: boolean;

  @Transform(({ obj }) => obj['custentity_has_instagram'] === 'T')
  @Expose({ name: 'custentity_has_instagram' })
  has_instagram: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_old_salesrep' })
  old_salesrep: string;

  @Transform(({ value }) => value)
  consolbalance: string;

  // TODO transform to valid date format
  custentity_plan_elite_inicio: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_tdollars_availables' })
  tdollars_availables: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_tj_exempt_customer_type' })
  tj_exempt_customer_type: string;

  // TODO transform to valid date format
  datecreated: string;

  // TODO transform to valid date format
  custentity_esc_last_modified_date: string;

  @Transform(({ value }) => value)
  version: string;

  @Transform(({ value }) => value)
  subsidiary: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_envio_gratis_25_descuento'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_envio_gratis_25_descuento' })
  envio_gratis_25_descuento: boolean;

  @Transform(({ value }) => value)
  overduebalance: string;

  // TODO transform to valid date format
  custentity_date_invoicecount_start: string;

  @Transform(
    ({ value }) => value !== null && value !== undefined && value !== '',
  )
  custentity36: boolean;

  // TODO i need the object
  custentity_resultado_de_contacto_con_cli: any;

  @Transform(({ obj }) => obj['custentity_hrc_smarthphone_ult_gen'] === 'T')
  @Expose({ name: 'custentity_hrc_smarthphone_ult_gen' })
  smarthphone_ult_gen: boolean;

  billaddr1: string;

  @Transform(
    ({ obj }) => obj['custentity_multivendor_store_name_active'] === 'T',
  )
  @Expose({ name: 'custentity_multivendor_store_name_active' })
  store_name_active: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_realiza3compras_magenta'] === 'T')
  @Expose({ name: 'custentity_hrc_realiza3compras_magenta' })
  realiza3compras_magenta: boolean;

  @Transform(({ obj }) => obj['custentity_mitiendatissini_new'] === 'T')
  @Expose({ name: 'custentity_mitiendatissini_new' })
  mitiendatissini_new: boolean;

  @Transform(({ value }) => value)
  custentity_cmic: string;

  @Transform(({ obj }) => obj['custentity_hrc_realiza3compras_azul'] === 'T')
  @Expose({ name: 'custentity_hrc_realiza3compras_azul' })
  realiza3compras_azul: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_metas_hace_tres_meses' })
  metas_hace_tres_meses: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_nacionalidad' })
  nacionalidad: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_obsequio_tarjetas_tissini'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_obsequio_tarjetas_tissini' })
  obsequio_tarjetas_tissini: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_obsequio_poster_publi'] === 'T')
  @Expose({ name: 'custentity_hrc_obsequio_poster_publi' })
  obsequio_poster_publi: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_invoice_count' })
  invoice_count: string;

  email: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'salesteamtotal' })
  salesteamtotal: string;

  @Transform(({ obj }) => obj['custentity_hrc_beneficio_atencion_pref'] === 'T')
  @Expose({ name: 'custentity_hrc_beneficio_atencion_pref' })
  beneficio_atencion_pref: boolean;

  @Transform(({ value }) => value)
  depositbalance: string;

  @Transform(({ obj }) => obj['custentity_hrc_descue_primera_azul'] === 'T')
  @Expose({ name: 'custentity_hrc_descue_primera_azul' })
  descue_primera_azul: boolean;

  @Transform(
    ({ obj }) => obj['custentity_hrc_descue_primera_compra_mes'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_descue_primera_compra_mes' })
  descue_primera_compra_mes: boolean;

  @Transform(({ obj }) => obj['custentity_planpiloto'] === 'T')
  @Expose({ name: 'custentity_planpiloto' })
  planpiloto: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'campaigncategory' })
  campaigncategory: string;

  @Transform(({ obj }) => obj['custentity_hrc_compra10_lleva11'] === 'T')
  @Expose({ name: 'custentity_hrc_compra10_lleva11' })
  compra10_lleva11: boolean;

  stage: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity10' })
  referred_by: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_invoice_amount' })
  invoice_amount: string;

  @Expose({ name: 'custentity_tissiniapp_token' })
  token: string;

  @Expose({ name: 'custentity_tj_exempt_customer_states' })
  tj_exempt_customer_states: string;

  @Expose({ name: 'entityid' })
  entityid: string;

  @Transform(({ obj }) => obj['custentity_hrc_descue_primera_lila'] === 'T')
  @Expose({ name: 'custentity_hrc_descue_primera_lila' })
  descue_primera_lila: boolean;

  @Transform(({ obj }) => obj['custentity_do_not_sale'] === 'T')
  @Expose({ name: 'custentity_do_not_sale' })
  do_not_sale: boolean;

  @IsString()
  shipcity: string;

  @IsString()
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
  mobilephone: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_metas_hace_dos_meses' })
  metas_hace_dos_meses: string;

  @Transform(({ obj }) => obj['hasshippingaddress'] === 'T')
  @Expose({ name: 'hasshippingaddress' })
  hasshippingaddress: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_kit_basico_redes'] === 'T')
  @Expose({ name: 'custentity_hrc_kit_basico_redes' })
  kit_basico_redes: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_realiza3compras_lila'] === 'T')
  @Expose({ name: 'custentity_hrc_realiza3compras_lila' })
  realiza3compras_lila: boolean;

  @Transform(
    ({ obj }) => obj['custentity_hrc_2_tiquets_aereos_nacional'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_2_tiquets_aereos_nacional' })
  dos_tiquets_aereos_nacional: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_plan_elite_escalafon' })
  custentity_plan_elite_escalafon: string;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_rosa'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_rosa' })
  reconocimiento_rosa: boolean;

  @Transform(({ value }) => value)
  leadsource: string;

  @Transform(({ obj }) => obj['custentity_hrc_feria_emprendimiento'] === 'T')
  @Expose({ name: 'custentity_hrc_feria_emprendimiento' })
  feria_emprendimiento: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_turquesa'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_turquesa' })
  reconocimiento_turquesa: boolean;

  @Expose({ name: 'firstname' })
  @IsString()
  firstname: string;

  @IsString()
  billzip: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_kit_personalizado_boutiqu'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_kit_personalizado_boutiqu' })
  kit_personalizado_boutiqu: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_realiza3compras'] === 'T')
  @Expose({ name: 'custentity_hrc_realiza3compras' })
  realiza3compras: boolean;

  @IsString()
  shippingcarrier: string;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_magenta'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_magenta' })
  reconocimiento_magenta: boolean;

  @Transform(({ value }) => value)
  consoloverduebalance: string;

  @Transform(({ obj }) => obj['custentity_state_restriction_override'] === 'T')
  @Expose({ name: 'custentity_state_restriction_override' })
  state_restriction_override: boolean;

  // TODO transform to valid date format
  custentity_last_call_date: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentitynum_sales_tissiniapp' })
  sales_tissiniapp: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_metas_mes_actual' })
  metas_mes_actual: string;

  @Transform(({ obj }) => obj['custentity_tj_exempt_customer'] === 'T')
  @Expose({ name: 'custentity_tj_exempt_customer' })
  tax_exempt: boolean;

  @IsString()
  shipaddr1: string;

  @IsString()
  billaddressee: string;

  @Transform(({ obj }) => obj['custentity_hrc_compra10_lleva11_rosa'] === 'T')
  @Expose({ name: 'custentity_hrc_compra10_lleva11_rosa' })
  compra10_lleva11_rosa: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_pagina_web_perso'] === 'T')
  @Expose({ name: 'custentity_hrc_pagina_web_perso' })
  pagina_web_perso: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_last_call_duration' })
  last_call_duration: string;

  @IsString()
  billcity: string;

  @Transform(({ obj }) => obj['custentity_pre_lanzamiento'] === 'T')
  @Expose({ name: 'custentity_pre_lanzamiento' })
  pre_lanzamiento: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_realiza3compras_rosa'] === 'T')
  @Expose({ name: 'custentity_hrc_realiza3compras_rosa' })
  realiza3compras_rosa: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_descue_primera_rosa'] === 'T')
  @Expose({ name: 'custentity_hrc_descue_primera_rosa' })
  descue_primera_rosa: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'entitynumber' })
  entitynumber: string;

  @IsString()
  billcountry: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_meses_total_acumulado' })
  meses_total_acumulado: string;

  @Transform(({ value }) => value)
  balance: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_braintree_customer_id' })
  braintree_customer_id: string;

  @Transform(({ obj }) => obj['custentity_has_facebook_account'] === 'T')
  @Expose({ name: 'custentity_has_facebook_account' })
  has_facebook_account: boolean;

  @Transform(({ value }) => Number(value))
  id: number;

  // TODO transform to valid date format
  @IsString()
  @Expose({ name: 'custentity1' })
  birthdate: string;

  @IsOptional()
  @IsNumber()
  @Expose({ name: 'custentity_kissts01_time_zone' })
  time_zone: number;

  @IsOptional()
  @IsNumber()
  @Expose({ name: 'custentity_rango_edad' })
  rango_edad: number;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_lila'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_lila' })
  reconocimiento_lila: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_descue_primera_celeste'] === 'T')
  @Expose({ name: 'custentity_hrc_descue_primera_celeste' })
  descue_primera_celeste: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_metas_mes_anterior' })
  metas_mes_anterior: string;

  @Expose({ name: 'custentity_birthday' })
  birthday: string;

  @Expose({ name: 'lastname' })
  lastname: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity_instagram_id' })
  instagram: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity_twitter_id' })
  twitter: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity_pinterest_id' })
  pinterest: string;

  @IsString()
  phone: string;

  @IsString()
  companyname: string;

  @Transform(({ obj }) => obj['custentity_hrc_beneficio_regalo_cumple'] === 'T')
  @Expose({ name: 'custentity_hrc_beneficio_regalo_cumple' })
  beneficio_regalo_cumple: boolean;

  @Transform(({ obj }) => obj['custentity_is_final_client'] === 'T')
  @Expose({ name: 'custentity_is_final_client' })
  is_final_client: boolean;

  @IsString()
  shipping_country: string;

  @Transform(({ obj }) => obj['custentity_hrc_beneficio_mentor_person'] === 'T')
  @Expose({ name: 'custentity_hrc_beneficio_mentor_person' })
  beneficio_mentor_person: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_ytd_invoice_amount' })
  ytd_invoice_amount: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_beneficio_primera_catalog'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_beneficio_primera_catalog' })
  beneficio_primera_catalog: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_descue_primera_turquesa'] === 'T')
  @Expose({ name: 'custentity_hrc_descue_primera_turquesa' })
  descue_primera_turquesa: boolean;

  @Transform(({ obj }) => obj['custentity_is_final_client'] === 'T')
  @Expose({ name: 'isperson' })
  isperson: boolean;

  @Transform(({ value }) => value)
  nluser: string;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_mejor'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_mejor' })
  reconocimiento_mejor: boolean;

  @Transform(({ value }) => value)
  salesrep: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_promo_level' })
  promo_level: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_beneficio_tissini_academi'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_beneficio_tissini_academi' })
  beneficio_tissini_academi: boolean;

  @IsString()
  billstate: string;

  @Transform(({ obj }) => obj['custentity_hrc_2_tiquets_aereos_intern'] === 'T')
  @Expose({ name: 'custentity_hrc_2_tiquets_aereos_intern' })
  dos_tiquets_aereos_intern: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_beneficio_tissini_pref'] === 'T')
  @Expose({ name: 'custentity_hrc_beneficio_tissini_pref' })
  beneficio_tissini_pref: boolean;

  @Transform(
    ({ obj }) => obj['custentity_hrc_publicidad_pagina_persona'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_publicidad_pagina_persona' })
  publicidad_pagina_persona: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_ytd_invoice_count' })
  ytd_invoice_count: string;

  @Transform(({ obj }) => obj['custentity_hrc_reconocimiento_celeste'] === 'T')
  @Expose({ name: 'custentity_hrc_reconocimiento_celeste' })
  reconocimiento_celeste: boolean;

  @IsOptional()
  @Expose({ name: 'custentity_facebook_id' })
  facebook: string;

  @IsString()
  shipzip: string;

  @Expose({ name: 'custentity_birthmonth' })
  birthmonth: string;

  @Transform(({ obj }) => obj['hasbillingaddress'] === 'T')
  @Expose({ name: 'hasbillingaddress' })
  hasbillingaddress: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_hrc_customer_insignia' })
  customer_insignia: string;

  @IsString()
  shipstate: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_salesrep_invoicecount_start' })
  salesrep_invoicecount_start: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'unbilledorders' })
  unbilledorders: string;

  @Expose({ name: 'custentity_birthyear' })
  birthyear: string;

  @Transform(({ obj }) => obj['custentity_hrc_beneficio_conv_grant'] === 'T')
  @Expose({ name: 'custentity_hrc_beneficio_conv_grant' })
  beneficio_conv_grant: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_salesrep_startofmonth' })
  salesrep_startofmonth: string;

  @Transform(({ obj }) => obj['isinactive'] === 'T')
  @Expose({ name: 'isinactive' })
  isinactive: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_kit_premium_redes'] === 'T')
  @Expose({ name: 'custentity_hrc_kit_premium_redes' })
  kit_premium_redes: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_descue_primera_magenta'] === 'T')
  @Expose({ name: 'custentity_hrc_descue_primera_magenta' })
  descue_primera_magenta: boolean;

  // TODO transform to valid date format
  custentity_fecha_asignacion_ritual: string;

  @Transform(({ obj }) => obj['custentity_ship_to_walgreens'] === 'T')
  @Expose({ name: 'custentity_ship_to_walgreens' })
  ship_to_walgreens: boolean;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentity_dream_in_money' })
  dream_in_money: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'entitystatus' })
  entitystatus: string;

  shipaddressee: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_compra10_lleva11_magenta'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_compra10_lleva11_magenta' })
  compra10_lleva11_magenta: boolean;

  @Transform(({ obj }) => obj['custentity_tissiniapp_rma_available'] === 'T')
  @Expose({ name: 'custentity_tissiniapp_rma_available' })
  rma_available: boolean;

  @Transform(({ obj }) => obj['custentity_hrc_beneficio_market_place'] === 'T')
  @Expose({ name: 'custentity_hrc_beneficio_market_place' })
  beneficio_market_place: boolean;

  @Expose({ name: 'entitytitle' })
  entitytitle: string;

  @IsString()
  shipcountry: string;

  @Transform(
    ({ obj }) => obj['custentity_hrc_beneficio_dias_cambio_ad'] === 'T',
  )
  @Expose({ name: 'custentity_hrc_beneficio_dias_cambio_ad' })
  beneficio_dias_cambio_ad: boolean;

  // TODO transform to valid date format
  lastmodifieddate: string;

  @Transform(({ obj }) => obj['custentity_communicate_through_sms'] === 'T')
  @Expose({ name: 'custentity_communicate_through_sms' })
  communicate_through_sms: boolean;

  @Expose({ name: 'custentitydream_1' })
  dream: string;

  @Transform(({ obj }) => obj['hasparent'] === 'T')
  @Expose({ name: 'hasparent' })
  hasparent: boolean;

  @Expose({ name: 'parent' })
  parent_id: string;

  @Transform(({ value }) => value)
  @Expose({ name: 'custentitynum_sales_mitienda' })
  sales_mitienda: string;

  @Transform(({ obj }) => obj['custentity_hrc_look_entutalla'] === 'T')
  @Expose({ name: 'custentity_hrc_look_entutalla' })
  look_entutalla: boolean;

  @Transform(({ value }) => value)
  monthlyclosing: string;

  @Expose({ name: 'custentity_multivendor_store_name' })
  store_name: string;

  @Transform(({ obj }) => obj['custentity_hrc_obsequio_pancarta_publi'] === 'T')
  @Expose({ name: 'custentity_hrc_obsequio_pancarta_publi' })
  obsequio_pancarta_publi: boolean;

  @IsOptional()
  @IsInt()
  @Expose({ name: 'custentity_tipo_1' })
  purchase_type: number;

  @IsOptional()
  @IsString()
  homephone: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity_ocupacion' })
  ocupacion: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity4' })
  first_child_name: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity6' })
  second_child_name: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity5' })
  first_child_birthdate: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'custentity8' })
  second_child_birthdate: string;

  @IsOptional()
  @Transform(({ obj }) => obj['custentity_catalyst_inboxsms_load'] === 'T')
  @Expose({ name: 'custentity_catalyst_inboxsms_load' })
  catalyst_inboxsms_load: boolean;

  @IsOptional()
  @Transform(({ obj }) => obj['custentity_catalyst_phonecall_load'] === 'T')
  @Expose({ name: 'custentity_catalyst_phonecall_load' })
  catalyst_phonecall_load: boolean;
}

export class CreateFromNetsuiteDTO {
  @Transform(({ value }) => value)
  id: string;

  @Transform(({ value }) => (value as string).toUpperCase())
  @IsEnum(USER_TYPES)
  type: USER_TYPES;

  @Allow()
  sublists: Sublists;

  @Allow()
  fields: Fields;
}
