import { Expose } from 'class-transformer';

export class UpdateTCoinsDTO {
  @Expose({ name: 'custentity_hrc_tcoins_perdidos' })
  tcoins_perdidos: number;

  @Expose({ name: 'custentity_hrc_tcoins_gastados' })
  tcoins_gastados: number;

  @Expose({ name: 'custentity_hrc_tcoins_disponibles' })
  tcoins_disponibles: number;

  @Expose({ name: 'custentity_hrc_total_tcoins_ganados' })
  tcoins_ganados: number;
}
