import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PoolishPizzasRecipeComponent } from './poolish-pizzas-recipe.component';

describe('PoolishPizzasRecipeComponent', () => {
  let component: PoolishPizzasRecipeComponent;
  let fixture: ComponentFixture<PoolishPizzasRecipeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PoolishPizzasRecipeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolishPizzasRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
