import { Component } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @Output() isLogout = new EventEmitter<void>();
  constructor(public firebaseService: FirebaseService, private router: Router) { }
  ngOnInit(): void {
  }
  async logout() {
    this.firebaseService.logout();
    this.isLogout.emit();
    this.router.navigate(['']);
  }


}
