import { Component, OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Import AngularFirestore

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Output() isLogout = new EventEmitter<void>();
  userData: any; // Define a variable to hold user data

  constructor(
    public firebaseService: FirebaseService, 
    private router: Router, 
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore // Inject AngularFirestore
  ) { }

  ngOnInit(): void {
    this.getAndLogUID();
  }

  async getAndLogUID() {
    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid;
      console.log("UID:", uid);

      // Now, fetch the user document using the UID
      this.firestore.collection('users').doc(uid).get().subscribe(doc => {
        if (doc.exists) {
          this.userData = doc.data(); // Save the user data
          console.log("User Data:", this.userData);
        } else {
          console.log("No such document!");
        }
      });
    }
  }

  async logout() {
    this.firebaseService.logout();
    this.isLogout.emit();
    this.router.navigate(['']);
  }
}
