import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DoughDirectRecipeComponent } from './dough-direct-recipe.component';

describe('DoughDirectRecipeComponent', () => {
  let component: DoughDirectRecipeComponent;
  let fixture: ComponentFixture<DoughDirectRecipeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DoughDirectRecipeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DoughDirectRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
