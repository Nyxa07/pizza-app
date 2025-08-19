import { Component, OnInit } from '@angular/core';
import { LucideAngularModule, RefreshCwIcon } from 'lucide-angular';
import { IonButton } from '@ionic/angular/standalone';
import { CalculatorStateService } from '../services/calculator-state.service';

@Component({
  selector: 'app-calculator-refresh-button',
  templateUrl: './calculator-refresh-button.component.html',
  styleUrls: ['./calculator-refresh-button.component.scss'],
  imports: [LucideAngularModule, IonButton],
  standalone: true,
})
export class CalculatorRefreshButtonComponent implements OnInit {
  readonly RefreshCwIcon = RefreshCwIcon;
  constructor(private calculatorState: CalculatorStateService) {}

  ngOnInit() {}

  refresh() {
    this.calculatorState.reset();
  }
}
