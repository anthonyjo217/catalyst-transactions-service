export interface CreateToNetsuiteDTO {
  id?: number;
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
  custentity_kissts01_time_zone: number;
  custentity_rango_edad: string;
  custentity_tissiniapp_rma_available: boolean;
  custentity_state_restriction_override: boolean;
  custentity4: string;
  custentity5: string;
  custentity6: string;
  custentity8: string;
  addresses: AddressDTO[];
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
