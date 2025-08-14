import { Component, inject, ViewEncapsulation } from '@angular/core';
import {
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { ToolbarSegmentsService } from '../../services/toolbar-segments.service';

@Component({
  selector: 'app-toolbar-segments',
  templateUrl: './toolbar-segments.component.html',
  imports: [IonToolbar, IonSegment, IonSegmentButton, IonLabel],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarSegmentsComponent {
  protected toolbarSegmentsService = inject(ToolbarSegmentsService);
  protected segments = this.toolbarSegmentsService.getSegments();
}
