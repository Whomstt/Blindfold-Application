import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

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
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
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
      // Copy userProfile object to newProfileData
      const { userProfile, uid } = this;
      const newProfileData = { ...userProfile };
  
      // Update profile in Firestore
      await this.firebaseService.updateProfile(uid, newProfileData);
      
      console.log('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }
  

  async logout() {
    this.firebaseService.logout();
    this.isLogout.emit();
    this.router.navigate(['']);
  }

  async uploadImage(event: any) {
    console.log('Uploading image...');
    try {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        
        // Create FileReader to read the uploaded file
        const reader = new FileReader();
        
        // Define the callback function for when the file is loaded
        reader.onload = async (e: any) => {
          try {
            // Create an image element to hold the uploaded image
            const img = new Image();
            img.src = e.target.result;
            
            // Define the callback function for when the image is loaded
            img.onload = async () => {
              try {
                // Log the image dimensions to ensure it's loaded properly
                console.log('Image dimensions:', img.width, 'x', img.height);
                
                // Calculate the size of the square to crop
                const size = Math.min(img.width, img.height);
                
                // Create a canvas element to perform cropping
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (ctx) { // Check if ctx is not null
                  // Set the canvas size to the calculated square size
                  canvas.width = size;
                  canvas.height = size;
                  
                  // Draw the image onto the canvas, cropping to the square
                  ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
                  
                  // Log the canvas dimensions to ensure the cropping is correct
                  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
                  
                  // Convert the canvas content to a Blob
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      // Log the blob size to ensure it's created correctly
                      console.log('Blob size:', blob.size);
                      
                      // Create a new File object from the Blob
                      const croppedFile = new File([blob], file.name, { type: 'image/png' });
                      
                      // Log the cropped file to ensure it's created correctly
                      console.log('Cropped file:', croppedFile);
                      
                      // Upload the cropped file to Firebase Storage
                      const snapshot = await this.storage.upload(`userProfileImages/${croppedFile.name}`, croppedFile);
                      
                      // Get the download URL of the uploaded image
                      const downloadURL = await snapshot.ref.getDownloadURL();
                      
                      // Update the user profile with the download URL
                      this.userProfile.profileImageURL = downloadURL;
                    }
                  }, 'image/png');
                } else {
                  console.error('Canvas context is null');
                }
              } catch (error) {
                console.error('Error cropping image:', error);
              }
            };
          } catch (error) {
            console.error('Error loading image:', error);
          }
        };
        
        // Read the uploaded file as a data URL
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
  

  async onFileSelected(event: any) {
    try {
      const file: File = event.target.files[0];
      
      // Set the profile image to the grey icon initially
      this.userProfile.profileImageURL = 'assets/images/uploading.jpg';
      
      // Call uploadImage to handle image upload
      this.uploadImage(event);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
}
