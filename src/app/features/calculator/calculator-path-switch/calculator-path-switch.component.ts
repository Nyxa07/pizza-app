import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { CalculatorPath } from '../enums/calculator-path.enum';

/** The calculator exposes two paths, each with its own persisted Draft. */
@Component({
  selector: 'app-calculator-path-switch',
  templateUrl: './calculator-path-switch.component.html',
  styleUrls: ['./calculator-path-switch.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
})
export class CalculatorPathSwitchComponent {
  protected readonly paths = [
    {
      path: CalculatorPath.GUIDED,
      label: 'calculator.paths.guided',
    },
    {
      path: CalculatorPath.EXPERT,
      label: 'calculator.paths.expert',
    },
  ] as const;
}
