import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslatePipe } from '@ngx-translate/core';

import { CalculatorMethods } from 'src/app/features/calculator/method/calculator-methods.service';
import { DoughSummaryService } from 'src/app/features/doughs/services/dough-summary.service';
import { DoughsService } from 'src/app/features/doughs/services/doughs.service';
import { MethodComponent } from 'src/app/features/method/method.component';
import { NumberPipe } from 'src/app/shared/pipes/number.pipe';

/** A saved Dough opened as a document without reading or changing the Draft. */
@Component({
  selector: 'app-dough-detail-page',
  templateUrl: './dough-detail.page.html',
  styleUrls: ['./dough-detail.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    NumberPipe,
    MethodComponent,
  ],
})
export class DoughDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doughs = inject(DoughsService);
  private readonly summaries = inject(DoughSummaryService);
  private readonly methods = inject(CalculatorMethods);

  protected readonly dough = this.doughs.get(
    this.route.snapshot.paramMap.get('id') ?? '',
  );
  /** The document facts, resolved through the same seam as the library card. */
  protected readonly summary = this.dough
    ? this.summaries.forDough(this.dough)
    : null;
  /** The saved input read as a method, through the same seam as the screens. */
  protected readonly method = this.dough
    ? this.methods.methodFor(this.dough.input)
    : null;

  protected adjust(): void {
    if (this.dough && this.doughs.adjust(this.dough.id)) {
      this.router.navigate(['/tabs/calculator/expert']);
    }
  }
}
