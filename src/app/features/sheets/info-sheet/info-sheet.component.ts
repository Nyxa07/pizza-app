import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { IonButton, IonContent } from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';

import { InfoSheetId } from '../enums/info-sheet-id.enum';
import type { IInfoSheetContent } from '../interfaces/info-sheet-content.interface';
import {
  InfoSheetContentService,
  type IInfoSheetLink,
} from '../services/info-sheet-content.service';

interface ActiveSheet {
  content: IInfoSheetContent;
  related: IInfoSheetLink[];
}

/**
 * A Fiche: the in-place explanation of a dough concept, rendered inside a
 * sheet modal (issue #70). Method Fiches link their siblings so the reader
 * can compare approaches without leaving the sheet.
 */
@Component({
  selector: 'app-info-sheet',
  templateUrl: './info-sheet.component.html',
  styleUrls: ['./info-sheet.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, TranslatePipe],
})
export class InfoSheetComponent implements OnInit {
  // Plain @Input so ModalController's componentProps can assign it.
  @Input({ required: true }) sheetId!: InfoSheetId;

  private readonly contentService = inject(InfoSheetContentService);

  protected readonly activeSheet = signal<ActiveSheet | null>(null);

  ngOnInit(): void {
    this.show(this.sheetId);
  }

  protected show(id: InfoSheetId): void {
    this.activeSheet.set({
      content: this.contentService.getContent(id),
      related: this.contentService.getRelated(id),
    });
  }
}
