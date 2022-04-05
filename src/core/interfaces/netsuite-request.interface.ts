export type NetsuiteMethods =
  | 'CustomerController.updateOrCreateAddress'
  | 'CustomerController.create';

export interface NetsuiteRequest<T = unknown> {
  method: NetsuiteMethods;
  values: T;
}
