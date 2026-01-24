import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculatorSettingsPage } from './settings.page';

describe('CalculatorSettingsPage', () => {
  let component: CalculatorSettingsPage;
  let fixture: ComponentFixture<CalculatorSettingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
