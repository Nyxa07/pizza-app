import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PoolishPizzasResultsComponent } from './poolish-pizzas-results.component';

describe('PoolishPizzasResultsComponent', () => {
  let component: PoolishPizzasResultsComponent;
  let fixture: ComponentFixture<PoolishPizzasResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PoolishPizzasResultsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolishPizzasResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
