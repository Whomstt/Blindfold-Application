// signup.component.ts
import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  isSignedIn = false;
  userID: string = '';
  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  userType: string = '';
  passwordErrorMessage: string = '';
  emailErrorMessage: string = '';

  constructor(
    public firebaseService: FirebaseService,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  async addUser(userID: string, userName: string, userEmail: string, userPassword: string, userType: string) {
    try {
      const newUser = {
        userID: userID,
        userName: userName,
        userEmail: userEmail,
        userPassword: userPassword,
        userType: userType
        // Add other fields as needed
      };

      // Add the new user document to the "users" collection
      await this.firestore.collection('users').add(newUser);

      console.log('New user added successfully!');
    } catch (error) {
      console.error('Error adding new user:', error);
    }
  }

  async onSubmit() {
    // Call addUser function with the provided form values
    await this.addUser(this.userID, this.userName, this.userEmail, this.userPassword, this.userType);
    this.onSignup(this.userEmail, this.userPassword);
  }

  // Other methods remain unchanged

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
