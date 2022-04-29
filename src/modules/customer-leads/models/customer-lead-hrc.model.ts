import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CustomerLeadHrc } from '~core/interfaces/customer-lead.interface';

// Este schema representa la estructura de los campos de tissini plus para un lead

@Schema()
export class CustomerLeadHrcModel implements CustomerLeadHrc {
  @Prop()
  realiza3compras_celeste: boolean;

  @Prop()
  beneficio_dev_pref_talla: boolean;

  @Prop()
  reconocimiento_azul: boolean;

  @Prop()
  envio_gratis_25_descuento: boolean;

  @Prop()
  smarthphone_ult_gen: boolean;

  @Prop()
  realiza3compras_magenta: boolean;

  @Prop()
  realiza3compras_azul: boolean;

  @Prop()
  obsequio_tarjetas_tissini: boolean;

  @Prop()
  obsequio_poster_publi: boolean;

  @Prop()
  beneficio_atencion_pref: boolean;

  @Prop()
  descue_primera_azul: boolean;

  @Prop()
  descue_primera_compra_mes: boolean;

  @Prop()
  compra10_lleva11: boolean;

  @Prop()
  descue_primera_lila: boolean;

  @Prop()
  kit_basico_redes: boolean;

  @Prop()
  realiza3compras_lila: boolean;

  @Prop()
  dos_tiquets_aereos_nacional: boolean;

  @Prop()
  reconocimiento_rosa: boolean;

  @Prop()
  feria_emprendimiento: boolean;

  @Prop()
  reconocimiento_turquesa: boolean;

  @Prop()
  kit_personalizado_boutiqu: boolean;

  @Prop()
  realiza3compras: boolean;

  @Prop()
  reconocimiento_magenta: boolean;

  @Prop()
  compra10_lleva11_rosa: boolean;

  @Prop()
  pagina_web_perso: boolean;

  @Prop()
  realiza3compras_rosa: boolean;

  @Prop()
  descue_primera_rosa: boolean;

  @Prop()
  reconocimiento_lila: boolean;

  @Prop()
  descue_primera_celeste: boolean;

  @Prop()
  beneficio_regalo_cumple: boolean;

  @Prop()
  beneficio_mentor_person: boolean;

  @Prop()
  beneficio_primera_catalog: boolean;

  @Prop()
  descue_primera_turquesa: boolean;

  @Prop()
  reconocimiento_mejor: boolean;

  @Prop()
  beneficio_tissini_academi: boolean;

  @Prop()
  dos_tiquets_aereos_intern: boolean;

  @Prop()
  beneficio_tissini_pref: boolean;

  @Prop()
  publicidad_pagina_persona: boolean;

  @Prop()
  reconocimiento_celeste: boolean;

  @Prop()
  customer_insignia: string;

  @Prop()
  beneficio_conv_grant: boolean;

  @Prop()
  kit_premium_redes: boolean;

  @Prop()
  descue_primera_magenta: boolean;

  @Prop()
  compra10_lleva11_magenta: boolean;

  @Prop()
  beneficio_market_place: boolean;

  @Prop()
  beneficio_dias_cambio_ad: boolean;

  @Prop()
  look_entutalla: boolean;

  @Prop()
  obsequio_pancarta_publi: boolean;
}

export const CustomerLeadHrcSchema =
  SchemaFactory.createForClass(CustomerLeadHrcModel);
