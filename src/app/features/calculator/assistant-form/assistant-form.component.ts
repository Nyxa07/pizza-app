import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { YeastType } from '../enums/yeast-type.enum';
import { CalculatorStateService } from '../services/calculator-state.service';
import { PizzaType } from '../../settings/enums/pizza-type.enum';

@Component({
  selector: 'app-assistant-form',
  templateUrl: './assistant-form.component.html',
  styleUrls: ['./assistant-form.component.scss'],
})
export class AssistantFormComponent implements OnInit {
  assistantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private state: CalculatorStateService,
  ) {
    this.assistantForm = this.fb.group({
      nbPizzas: [state.getInput().nbPizzas || 1],
      temperature: [state.getInput().temperature || 20],
      yeastType: [state.getInput().yeastType || YeastType.DRY_ACTIVE],
      targetDate: [new Date()],
      pizzaType: [PizzaType.NEAPOLITAN],
    });
  }

  ngOnInit() {}
}
