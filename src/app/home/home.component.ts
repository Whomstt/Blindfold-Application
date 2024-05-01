import { Component, OnInit } from '@angular/core';
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
  searchQuery: string = ''; 
  interests: any = {};
  uid: string = ''; 
  userProfile: any; 

  constructor(
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
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  } 

  onSearch() {
    let searchQuery = `${this.searchQuery}`;
    for (const [key, value] of Object.entries(this.interests)) {
      if (value) {
        searchQuery += `,${key}`;
      }
    }
    this.router.navigate(['/search-list'], { queryParams: { query: searchQuery } });
  }
}

