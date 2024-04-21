import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  uid: string = ''; // Initialize UID
  userChats: any[] = [];
  chatMessages: any[] = [];
  selectedChatId: string | null = null;

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  async ngOnInit(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.uid = user.uid;
      console.log("UID:", this.uid);
    }

    const chatsCollection = this.firestore.collection('chats');
    chatsCollection.get().subscribe(snapshot => {
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
        }
      });
    });
  }

  loadMessages(chatId: string): void {
    this.selectedChatId = chatId;
    this.chatMessages = []; // Clear previous messages
    const messagesCollection = this.firestore.collection(`chats/${chatId}/messages`);
    messagesCollection.get().subscribe(messagesSnapshot => {
      messagesSnapshot.forEach(messageDoc => {
        const messageData = messageDoc.data();
        this.chatMessages.push({
          messageId: messageDoc.id,
          data: messageData
        });
        console.log("Message ID:", messageDoc.id);
        console.log("Message Data:", messageData);
      });
    });
  }
}
