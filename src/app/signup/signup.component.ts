import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  isSignedIn = false;
  userID: number = 0;
  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  userPassword2: string= '';
  userType: string = 'User';
  errorMessage: string = ''; // Declare error message variable

  constructor(
    public firebaseService: FirebaseService,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  async addUser(userID: number, userName: string, userEmail: string, userPassword: string, userPassword2: string, userType: string) {
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
        // Call onSignup() after user is added successfully
        await this.onSignup(userEmail, userPassword);
    } catch (error: any) {
        this.errorMessage = error.message;
        console.error('Error adding new user:', error);
    }
  }

  async onSubmit() {
    // Generate userID dynamically
    const lastUserID = await this.getLastUserID().toPromise();
    const newUserID = this.incrementUserID(lastUserID); // Increment if lastUserID is not null, otherwise start from 1
    // Call addUser function with the provided form values
    console.log(newUserID, this.userName, this.userEmail, this.userPassword, this.userType);
    await this.addUser(newUserID, this.userName, this.userEmail, this.userPassword, this.userPassword2, this.userType);
  }

  getLastUserID(): Observable<number | null> {
    // Query Firestore to get the last user's ID
    return this.firestore.collection('users', ref => ref.orderBy('userID', 'desc').limit(1))
      .get()
      .pipe(
        map(snapshot => {
          if (!snapshot.empty) {
            const lastUser = snapshot.docs[0].data() as { userID: number };
            return lastUser.userID;
          } else {
            return null;
          }
        })
      );
  }

  incrementUserID(lastUserID: number | null | undefined): number {
    if (lastUserID !== null && lastUserID !== undefined) {
      return lastUserID + 1;
    } else {
      return 1;
    }
  }

  ngOnInit() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('user') !== null)
      this.isSignedIn = true;
    else
      this.isSignedIn = false;
  }

  async onSignup(email: string, password: string) {
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
