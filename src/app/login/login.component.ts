import { Component } from '@angular/core';
import { FirebaseService } from "../services/firebase.service";
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  isSignedIn = false;
  passwordErrorMessage: string = '';
  emailErrorMessage: string = '';

  constructor(public firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('user') !== null)
      this.isSignedIn = true;
    else
      this.isSignedIn = false;
  }

  async onSignin(email: string, password: string) {
    await this.firebaseService.signin(email, password);
    if (this.firebaseService.isLoggedIn)
      this.isSignedIn = true;
      this.router.navigate(['/home']);
  }

  handleLogout() {
    this.isSignedIn = false;
  }
}
