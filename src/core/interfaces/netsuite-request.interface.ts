export type NetsuiteMethods =
  | 'CustomerController.updateOrCreateAddress'
  | 'CustomerController.create'
  | 'CustomerController.refreshCustomer';

export interface NetsuiteRequest<T = unknown> {
  method: NetsuiteMethods;
  values: T;
}
