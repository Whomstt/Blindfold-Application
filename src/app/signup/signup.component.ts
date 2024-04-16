import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  isSignedIn = false;
  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  userPassword2: string= '';
  userType: string = 'User';
  errorMessage: string = ''; // Declare error message variable

  constructor(
    public firebaseService: FirebaseService,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  async addUser(uid: string, userName: string, userEmail: string, userPassword: string, userPassword2: string, userType: string) {
    try {
        // Validation checks
        if (userName.length < 6) {
            throw new Error('Username must be 6 characters long.');
        }
        if (userPassword.length < 6) {
            throw new Error('Password must be 6 characters long.');
        }
        if (userPassword2 !== userPassword){
          throw new Error('Passwords do not match')
        }
        if (!userEmail.includes('@')) {
            throw new Error('Invalid email address.');
        }

        const newUser = {
            userID: uid, // Use the UID as the user ID
            userName: userName,
            userEmail: userEmail,
            userPassword: userPassword,
            userType: userType,
            // Add other fields as needed
        };

        // Add the new user document to the "users" collection
        await this.firestore.collection('users').doc(uid).set(newUser);

        console.log('New user added successfully!');
        // Call onSignup() after user is added successfully
        await this.onSignup(userEmail, userPassword);
    } catch (error: any) {
        this.errorMessage = error.message;
        console.error('Error adding new user:', error);
    }
  }

  async onSubmit() {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(this.userEmail, this.userPassword);
      if (user) {
        this.isSignedIn = true;
        // Call addUser with the UID
        await this.addUser(user.uid, this.userName, this.userEmail, this.userPassword, this.userType);
        
        // Redirect to desired route after successful signup
        this.router.navigate(['/home']); // Redirect to home page
      } else {
        throw new Error("User creation failed.");
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      this.errorMessage = error.message;
    }
  }

  async onSignup(email: string, password: string) {
    try {
        await this.afAuth.createUserWithEmailAndPassword(email, password);
        this.isSignedIn = true;
        
        // Redirect to desired route after successful signup
        this.router.navigate(['/home']); // Redirect to home page
    } catch (error) {
        console.error("Signup Error:", error);
        // Handle error here
    }
  }

  ngOnInit() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('user') !== null)
      this.isSignedIn = true;
    else
      this.isSignedIn = false;
  }

  handleLogout() {
    this.isSignedIn = false;
  }
}
