import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculatorPlannerPage } from './planner.page';

describe('PlannerPage', () => {
  let component: CalculatorPlannerPage;
  let fixture: ComponentFixture<CalculatorPlannerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorPlannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
