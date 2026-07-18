import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { CalculatorStateShareComponent } from './calculator-state-share.component';

describe('CalculatorStateShareComponent', () => {
  let component: CalculatorStateShareComponent;
  let fixture: ComponentFixture<CalculatorStateShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorStateShareComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorStateShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
