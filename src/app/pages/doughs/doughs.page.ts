import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import {
  ActionSheetController,
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  EllipsisIcon,
  LibraryIcon,
  LucideAngularModule,
  SettingsIcon,
} from 'lucide-angular';

import type { Dough } from 'src/app/features/doughs/interfaces/dough.interface';
import { DoughSummaryService } from 'src/app/features/doughs/services/dough-summary.service';
import { DoughsService } from 'src/app/features/doughs/services/doughs.service';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

@Component({
  selector: 'app-doughs-page',
  templateUrl: './doughs.page.html',
  styleUrls: ['./doughs.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonToast,
    TranslatePipe,
    NumberPipe,
    LucideAngularModule,
    RouterLink,
  ],
})
export class DoughsPage {
  private readonly doughsService = inject(DoughsService);
  private readonly summaries = inject(DoughSummaryService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly alertController = inject(AlertController);

  protected readonly LibraryIcon = LibraryIcon;
  protected readonly EllipsisIcon = EllipsisIcon;
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly toastMessage = signal('');
  protected readonly doughs = toSignal(this.doughsService.getDoughs$(), {
    initialValue: this.doughsService.list(),
  });
  /** Each document with its resolved facts: a card never reads a raw input. */
  protected readonly cards = computed(() =>
    this.doughs().map((dough) => ({
      dough,
      summary: this.summaries.forDough(dough),
    })),
  );

  protected open(dough: Dough): void {
    this.router.navigate(['/tabs/doughs', dough.id]);
  }

  protected async presentActions(event: Event, dough: Dough): Promise<void> {
    event.stopPropagation();
    const actionSheet = await this.actionSheetController.create({
      header: dough.name,
      buttons: [
        {
          text: this.translate.instant('common.actions.rename'),
          handler: () => this.rename(dough),
        },
        {
          text: this.translate.instant('common.actions.duplicate'),
          handler: () => this.duplicate(dough),
        },
        {
          text: this.translate.instant('common.actions.delete'),
          role: 'destructive',
          handler: () => this.confirmDelete(dough),
        },
        {
          text: this.translate.instant('common.actions.cancel'),
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private async rename(dough: Dough): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('pages.doughs.renameTitle'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: dough.name,
          placeholder: this.translate.instant('pages.doughs.nameLabel'),
        },
      ],
      buttons: [
        {
          text: this.translate.instant('common.actions.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('common.actions.save'),
          handler: (values: { name?: string }) => {
            const renamed = this.doughsService.rename(
              dough.id,
              values.name ?? '',
            );
            if (renamed) {
              this.showToast('pages.doughs.renamed');
            }
            return renamed;
          },
        },
      ],
    });
    await alert.present();
  }

  private duplicate(dough: Dough): void {
    this.doughsService.duplicate(
      dough.id,
      this.translate.instant('pages.doughs.copyName', { name: dough.name }),
    );
    this.showToast('pages.doughs.duplicated');
  }

  private async confirmDelete(dough: Dough): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('common.titles.confirm'),
      message: this.translate.instant('pages.doughs.confirmDelete', {
        name: dough.name,
      }),
      buttons: [
        {
          text: this.translate.instant('common.actions.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('common.actions.delete'),
          role: 'destructive',
          handler: () => {
            this.doughsService.delete(dough.id);
            this.showToast('pages.doughs.deleted');
          },
        },
      ],
    });
    await alert.present();
  }

  private showToast(messageKey: string): void {
    this.toastMessage.set(messageKey);
  }
}
