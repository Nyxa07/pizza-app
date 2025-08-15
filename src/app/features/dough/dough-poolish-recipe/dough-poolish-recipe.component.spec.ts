import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DoughPoolishRecipeComponent } from './dough-poolish-recipe.component';

describe('DoughPoolishRecipeComponent', () => {
  let component: DoughPoolishRecipeComponent;
  let fixture: ComponentFixture<DoughPoolishRecipeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DoughPoolishRecipeComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DoughPoolishRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
