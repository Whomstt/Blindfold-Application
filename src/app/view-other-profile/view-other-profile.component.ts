import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-view-other-profile',
  templateUrl: './view-other-profile.component.html',
  styleUrls: ['./view-other-profile.component.css']
})
export class ViewOtherProfileComponent implements OnInit {
  userID: string = "";
  userProfile: any; // Define the type of userProfile based on your data structure

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    // Get the userID from the route parameters
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
      // Call a method to fetch user profile based on userID
      this.fetchUserProfile(this.userID);
    });
  }

  fetchUserProfile(userID: string): void {
    // Use AngularFirestore to fetch user profile based on userID
    this.firestore.collection('profiles').doc(userID).valueChanges().subscribe(
      (profile: any) => {
        // Assign the fetched profile to userProfile
        this.userProfile = profile;
      },
      error => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  async startChatting(): Promise<void> {
    try {
      // Get the current signed-in user's ID (userID1)
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        const userID1 = currentUser.uid;
        
        // Generate a unique chatID
        const chatID = this.generateChatID();
        
        // Determine userID2 from the profile being viewed
        const userID2 = this.userID;
        
        // Create a new document in the messages collection
        await this.firestore.collection('chats').doc(chatID).set({
          userID1: userID1,
          userID2: userID2
        });
        
        // Navigate to the messages page
        this.router.navigate(['/messages']);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }

  generateChatID(): string {
    // Generate a unique ID using Firebase's built-in functionality
    return this.firestore.createId();
  }
}
