import { Component } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})

export class AppComponent implements OnInit {
  title = 'blindfold-app';
  isSignedIn = false;
  passwordErrorMessage: string = '';
  emailErrorMessage: string = '';

  constructor(public firebaseService: FirebaseService) {}

  ngOnInit() {
    if (localStorage.getItem('user') !== null)
      this.isSignedIn = true;
    else
      this.isSignedIn = false;
  }

  async onSignup(email: string, password: string) {
    // Check email length
    if (password.length < 6) {
      this.passwordErrorMessage = 'Password must be at least 6 characters long.';
      return; // Don't proceed further
    }
  
    // Check if email already exists
    const emailExists = await this.firebaseService.checkEmailExists(email);
    if (emailExists) {
      this.emailErrorMessage = 'This email is already being used.';
      return; // Don't proceed further
    } else {
      this.emailErrorMessage = ''; // Reset error message if email is valid
    }
  
    // Sign up
    await this.firebaseService.signup(email, password);
    if (this.firebaseService.isLoggedIn)
      this.isSignedIn = true;
  }

  async onSignin(email: string, password: string) {
    await this.firebaseService.signin(email, password);
    if (this.firebaseService.isLoggedIn)
      this.isSignedIn = true;
  }

  handleLogout() {
    this.isSignedIn = false;
  }
}
