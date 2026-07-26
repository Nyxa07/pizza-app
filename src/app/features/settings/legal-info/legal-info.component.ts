import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';

/**
 * The legal footer of the Settings screen (issue #96): the store-required way
 * out to the public privacy policy. Purely presentational — it owns no form
 * control, so the page alone decides that it comes last.
 */
@Component({
  selector: 'app-legal-info',
  templateUrl: './legal-info.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonLabel, IonList, IonListHeader, TranslatePipe],
})
export class LegalInfoComponent {
  protected readonly privacyPolicyUrl =
    'https://nyxa07.github.io/pizza-app/privacy/';
}
