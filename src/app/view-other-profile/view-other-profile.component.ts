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
  userProfile: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
      this.fetchUserProfile(this.userID);
    });
  }

  fetchUserProfile(userID: string): void {
    this.firestore.collection('profiles').doc(userID).valueChanges().subscribe(
      (profile: any) => {
        let check = false;
        while(!profile.userBanned && !check) {
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
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        const userID1 = currentUser.uid;
        
        const userID2 = this.userID;
        
        const chatExists1 = await this.checkChatExists(userID1, userID2);
        const chatExists2 = await this.checkChatExists(userID2, userID1);
  
        if (chatExists1 || chatExists2) {
          this.router.navigate(['/messages']);
          return;
        }
        
        const chatID = this.generateChatID();
        
        await this.firestore.collection('chats').doc(chatID).set({
          userID1: userID1,
          userID2: userID2
        });
        
        this.router.navigate(['/messages']);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }
  
  async checkChatExists(userID1: string, userID2: string): Promise<boolean> {
    const existingChat = await this.firestore.collection('chats', ref => ref
      .where('userID1', '==', userID1)
      .where('userID2', '==', userID2)
      .limit(1)
    ).get().toPromise();

    return existingChat !== undefined && !existingChat.empty;
  }

  generateChatID(): string {
    return this.firestore.createId();
  }
}
