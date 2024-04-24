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
        let check = false;
        while(!profile.userBanned && !check) { // Check if profile exists and user is not banned
          // Assign the fetched profile to userProfile
          this.userProfile = profile;
          check = true;
        }
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
        
        // Determine userID2 from the profile being viewed
        const userID2 = this.userID;
        
        // Check if a chat with the pair already exists in both possible orders
        const chatExists1 = await this.checkChatExists(userID1, userID2);
        const chatExists2 = await this.checkChatExists(userID2, userID1);
  
        // If a chat with the pair already exists, navigate to the messages page
        if (chatExists1 || chatExists2) {
          this.router.navigate(['/messages']);
          return;
        }
        
        // Generate a unique chatID
        const chatID = this.generateChatID();
        
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
  
  async checkChatExists(userID1: string, userID2: string): Promise<boolean> {
    // Check if a chat exists between userID1 and userID2
    const existingChat = await this.firestore.collection('chats', ref => ref
      .where('userID1', '==', userID1)
      .where('userID2', '==', userID2)
      .limit(1) // Limit to 1 document
    ).get().toPromise();

    // Return true if the chat exists
    return existingChat !== undefined && !existingChat.empty;
  }

  generateChatID(): string {
    // Generate a unique ID using Firebase's built-in functionality
    return this.firestore.createId();
  }
}
