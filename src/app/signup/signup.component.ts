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
  userPassword2: string = '';
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
        const newUser = {
            userID: uid, // Use the UID as the user ID
            userName: userName,
            userType: userType,
            // Add other fields as needed
        };

        // Add the new user document to the "users" collection
        await this.firestore.collection('users').doc(uid).set(newUser);

        console.log('New user added successfully!');

        // Call addProfile after user is added successfully
        await this.addProfile(uid, 18, '', '', false, '', '', false, false, false, false, false, false, false, false, false); // Pass necessary arguments for profile creation

        console.log('Profile created successfully!');

        // Call onSignup() after user and profile are added successfully
        await this.onSignup(userEmail, userPassword);
    } catch (error: any) {
        this.errorMessage = error.message;
        console.error('Error adding new user:', error);
        return; // Halt the process if an error occurred
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

  async addProfile(uid: string, userAge: number, userGender: string, 
    userSeeking: string, userBanned: boolean, userBio: string, userRealName: string,
    userReading: boolean, userFilm: boolean, userCooking: boolean, userSport: boolean, userTravel: boolean, userGaming: boolean,
    userMusic: boolean, userSmoker: boolean, userDrinker: boolean) {
    try {
        const newProfile = {
            userID: uid,
            userAge: userAge,
            userGender: userGender,
            userSeeking: userSeeking,
            userBanned: userBanned,
            userBio: userBio,
            userRealName: userRealName,
            userReading: userReading,
            userFilm: userFilm,
            userCooking: userCooking,
            userSport: userSport,
            userTravel: userTravel,
            userGaming: userGaming,
            userMusic: userMusic,
            userSmoker: userSmoker,
            userDrinker: userDrinker,
        };

        await this.firestore.collection('profiles').doc(uid).set(newProfile);
        console.log('New profile added successfully!');
    } catch (error: any) {
        console.error('Error adding new profile:', error);
    }
  }

  async onSubmit() {
    if (this.userPassword !== this.userPassword2) {
      this.errorMessage = "Passwords do not match.";
      return;
    }
    if (this.userPassword.length < 6) {
      this.errorMessage = "Password must be at least 6 characters long.";
      return;
    }
    if (this.userName.length < 6) {
      this.errorMessage = "Username must be at least 6 characters long.";
      return;
    }
    if (!this.userEmail.includes('@')) {
      this.errorMessage = "Invalid email address.";
      return;
    }
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(this.userEmail, this.userPassword);
      if (user) {
        this.isSignedIn = true;
        // Call addUser with the UID
        await this.addUser(user.uid, this.userName, this.userEmail, this.userPassword, this.userPassword2, this.userType);
        
        // Redirect to desired route after successful signup
        this.router.navigate(['/profile']); // Redirect to home page
      } else {
        throw new Error("User creation failed.");
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      this.errorMessage = error.message;
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
