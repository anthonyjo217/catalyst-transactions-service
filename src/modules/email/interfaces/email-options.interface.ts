export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  variables?: { [key: string]: string };
  template?: string;
}
