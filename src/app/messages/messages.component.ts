import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  uid: string = ''; // Initialize UID
  userChats: any[] = [];
  chatMessages: any[] = [];
  selectedChatID: string | null = null;
  messageContent: string = '';
  matchedUserRealNames: { [key: string]: string } = {}; // Map to store matched user real names by ID
  matchedProfileImageURLs: { [key: string]: string } = {}; // Map to store matched user image URLs by ID

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  async ngOnInit(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.uid = user.uid;
      console.log("UID:", this.uid);
    }

    this.firestore.collection('chats').get().subscribe(snapshot => {
      snapshot.forEach(chatDoc => {
        const chatData: any = chatDoc.data();
        const userID1 = chatData.userID1;
        const userID2 = chatData.userID2;

        if (userID1 === this.uid || userID2 === this.uid) {
          this.userChats.push({
            id: chatDoc.id,
            data: chatData
          });

          console.log("Chat ID:", chatDoc.id);
          console.log("Chat Data:", chatData);

          // Fetch matched user's profile data to get real name and image URL
          const matchedUserID = userID1 === this.uid ? userID2 : userID1;
          this.fetchMatchedUserInfo(matchedUserID);
        }
      });
    });
  }

  fetchMatchedUserInfo(userID: string): void {
    console.log('Fetching info for userID:', userID);
    this.firestore.collection('profiles').doc(userID).get().subscribe(
      (profileDoc: any) => {
        if (profileDoc.exists) {
          const profileData = profileDoc.data();
          console.log('Profile data for userID:', userID, profileData);
          this.matchedUserRealNames[userID] = profileData.userRealName;
          this.matchedProfileImageURLs[userID] = profileData.profileImageURL; // Store image URL
          console.log('Matched user real name:', this.matchedUserRealNames[userID]);
          console.log('Matched user image URL:', this.matchedProfileImageURLs[userID]);
        } else {
          console.error('Profile does not exist for userID:', userID);
        }
      },
      error => {
        console.error('Error fetching profile data for userID:', userID, error);
      }
    );
  }

  loadMessages(chatID: string): void {
    this.selectedChatID = chatID;
    this.chatMessages = []; // Clear previous messages
    const messagesCollection = this.firestore.collection(`chats/${chatID}/messages`);
    messagesCollection.get().subscribe(messagesSnapshot => {
      messagesSnapshot.forEach(messageDoc => {
        const messageData = messageDoc.data();
        this.chatMessages.push({
          messageId: messageDoc.id,
          data: messageData
        });
      });
      // Sort messages by timestamp
      this.chatMessages.sort((a, b) => a.data.timestamp - b.data.timestamp);
    });
  }

  sendMessage(content: string, chatId: string): void {
    const messageRef = this.firestore.collection(`chats/${chatId}/messages`).doc(); // Automatically generate a message ID
    const messageData = {
      content: content,
      senderID: this.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add timestamp field
      // You can add more fields here if needed
    };
    messageRef.set(messageData)
      .then(() => {
        console.log('Message sent successfully');
        // Optionally, you can reload the chat messages after sending the message
        this.loadMessages(chatId);
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }

  sendMessageForm(chatId: string): void {
    if (this.messageContent.trim() !== '') {
      this.sendMessage(this.messageContent, chatId);
      this.messageContent = ''; // Clear the input field after sending the message
    }
  }
}
