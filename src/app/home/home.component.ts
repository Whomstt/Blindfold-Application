import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null; // Initialize userEmail
  searchQuery: string = '';
  uid: string = ''; // Initialize UID
  userProfile: any; // Initialize userProfile to hold user profile data

  constructor(
    private firebaseService: FirebaseService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  async ngOnInit(): Promise<void> {
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

  async logout() {
    this.firebaseService.logout();
    this.router.navigate(['']);
  }

  onSearch() {
    // Redirect to search-list component with the search query as a parameter
    this.router.navigate(['/search-list'], { queryParams: { query: this.searchQuery } });
  }
}
