import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOtherProfileComponent } from './view-other-profile.component';

describe('ViewOtherProfileComponent', () => {
  let component: ViewOtherProfileComponent;
  let fixture: ComponentFixture<ViewOtherProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewOtherProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewOtherProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
