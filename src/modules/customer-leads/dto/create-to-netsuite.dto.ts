// Estas interfaces son usadas para validar los DTO que se usan para crear o actualizar una lead a netsuite

export interface CreateToNetsuiteDTO {
  id?: string;
  firstname: string;
  lastname: string;
  email?: string;
  mobilephone: string;
  custentitydream_1: string;
  custentity_dream_in_money: number;
  salesrep: string;
  custentity_multivendor_store_name?: string;
  custentity_instagram_id?: string;
  custentity_twitter_id?: string;
  custentity_pinterest_id?: string;
  custentity_facebook_id?: string;
  custentity1?: string;
  custentity10?: string;
  custentity_kissts01_time_zone: number;
  custentity_rango_edad: string;
  custentity_tissiniapp_rma_available: boolean;
  custentity_state_restriction_override: boolean;
  custentity4: string;
  custentity5: string;
  custentity_resultado_de_contacto_con_cli: string;
  custentity6: string;
  custentity8: string;
  custentity_ship_to_walgreens: boolean;
  parent: string;
  addresses: AddressDTO[];
  custentity_is_final_client: boolean;
  custentity_resultado_de_contacustentity_resultado_de_contacto_con_cli_old: string;
}

export interface CreateAddressToNetsuiteDTO {
  userId: string;
  addressId?: string;
  address: {
    address1: string;
    address2?: string;
    address3?: string;
    zipcode: string;
    mobilephone: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface AddressDTO {
  address: string;
  address2?: string;
  address3?: string;
  zipcode: string;
  mobilephone: string;
  city: string;
  state: string;
  country: string;
}
