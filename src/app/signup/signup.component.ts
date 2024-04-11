import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  isSignedIn = false;
  passwordErrorMessage: string = '';
  emailErrorMessage: string = '';


  constructor(public firebaseService: FirebaseService, private router: Router) { }
  ngOnInit() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('user') !== null)
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

    await this.firebaseService.signup(email, password);
    if (this.firebaseService.isLoggedIn)
      this.isSignedIn = true;
    
    // Redirect to desired route after successful signup
    this.router.navigate(['/home']); // Redirect to home page
  }
  handleLogout() {
    this.isSignedIn = false;
  }
}
