export interface Identifications {
  id: string;
  max_length: number;
  min_length: number;
  name: string;
  type: string;
}

export interface Issuers {
  id: string;
  merchant_account_id: string;
  name: string;
  processing_mode: string;
  secure_thumbnail: string;
  thumbnail: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: 'credit_card' | 'debit_card' | 'ticket';
  status: string;
  secure_thumbnail: string;
  thumbnail: string;
  deferred_capture: string;
  settings: Setting[];
  additional_info_needed: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  accreditation_time: number;
  financial_institutions: any[];
  processing_modes: string[];
}

export interface Setting {
  card_number: CardNumber;
  bin: Bin;
  security_code: SecurityCode;
}

export interface SecurityCode {
  length: number;
  card_location: string;
  mode: string;
}

export interface Bin {
  pattern: string;
  installments_pattern: string;
  exclusion_pattern?: string;
}

export interface CardNumber {
  validation: string;
  length: number;
}

export interface CardToken {
  card_number_length: number;
  cardholder: Cardholder;
  date_created: string;
  date_due: string;
  date_last_updated: string;
  expiration_month: number;
  expiration_year: number;
  first_six_digits: string;
  id: string;
  last_four_digits: string;
  live_mode: boolean;
  luhn_validation: boolean;
  public_key: string;
  require_esc: boolean;
  security_code_length: number;
  status: string;
}

export interface Cardholder {
  identification: Identification;
  name: string;
}

export interface Identification {
  number: string;
  type: string;
}
