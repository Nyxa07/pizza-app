import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { LucideAngularModule, Share2Icon } from 'lucide-angular';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-calculator-state-share',
  templateUrl: './calculator-state-share.component.html',
  styleUrls: ['./calculator-state-share.component.scss'],
  standalone: true,
  imports: [IonButton, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorStateShareComponent implements OnInit {
  readonly ShareIcon = Share2Icon;

  constructor() {}

  ngOnInit() {}

  async onShare() {
    await Share.share({
      title: 'See cool stuff',
      text: 'Really awesome thing you need to see right meow',
      url: 'pizzamaker://calculator/results',
      dialogTitle: 'Share with buddies',
    });
  }
}
