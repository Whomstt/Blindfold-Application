import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Output() isLogout = new EventEmitter<void>();
  uid: string = ''; // Initialize UID
  userProfile: any; // Initialize userProfile to hold user profile data
  newProfileData: any = {}; // Assuming you have the new profile data to update

  constructor(
    private firebaseService: FirebaseService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    // Accessing UID
    const user = await this.afAuth.currentUser;
    if (user) {
      this.uid = user.uid;
      console.log("UID:", this.uid);

      // Fetch user profile data
      await this.getUserProfile();
    }
  }

  async getUserProfile() {
    try {
      const userProfileDoc = await this.firestore.collection('profiles').doc(this.uid).get().toPromise();
      if (userProfileDoc && userProfileDoc.exists) {
        this.userProfile = userProfileDoc.data();
        console.log('User profile fetched successfully:', this.userProfile);
      } else {
        console.log('User profile does not exist.');
        // Handle the case where the user profile does not exist
        // You can initialize this.userProfile to an empty object or handle it based on your application logic
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      // Handle error as needed
    }
  }  

  async updateProfile() {
    try {
      this.newProfileData.userAge = this.userProfile.userAge;
      this.newProfileData.userGender = this.userProfile.userGender;
      this.newProfileData.userSeeking = this.userProfile.userSeeking;
      this.newProfileData.userRealName = this.userProfile.userRealName;
      this.newProfileData.userBio = this.userProfile.userBio;
      await this.firebaseService.updateProfile(this.uid, this.newProfileData);
      console.log('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // You can now handle the selected file, such as uploading it to a server or displaying it preview.
    }
  }

  async logout() {
    this.firebaseService.logout();
    this.isLogout.emit();
    this.router.navigate(['']);
  }
}
