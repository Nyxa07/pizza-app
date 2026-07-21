import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { IonButton, ModalController } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';
import { InfoIcon, LucideAngularModule } from 'lucide-angular';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import { InfoSheetComponent } from '../info-sheet/info-sheet.component';

/**
 * The ⓘ affordance: opens the Fiche explaining a concept right where the
 * question arises (issue #70), as a sheet modal in the v2 identity.
 */
@Component({
  selector: 'app-info-sheet-button',
  templateUrl: './info-sheet-button.component.html',
  styleUrls: ['./info-sheet-button.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, LucideAngularModule, TranslatePipe],
})
export class InfoSheetButtonComponent {
  readonly sheetId = input.required<InfoSheetId>();

  private readonly modalController = inject(ModalController);

  protected readonly InfoIcon = InfoIcon;

  protected async open(event: Event): Promise<void> {
    // Keep the tap from reaching the host form control (e.g. ion-select).
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: InfoSheetComponent,
      componentProps: { sheetId: this.sheetId() },
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 0.85],
      handleBehavior: 'cycle',
    });
    await modal.present();
  }
}
