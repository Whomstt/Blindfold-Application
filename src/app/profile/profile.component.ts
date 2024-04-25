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
  uid: string = ''; 
  userProfile: any; 
  newProfileData: any = {}; 

  constructor(
    private firebaseService: FirebaseService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  async ngOnInit() {
    
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

  async updateProfile() {
    try {
      
      const { userProfile, uid } = this;
      const newProfileData = { ...userProfile };
  
      
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
        
        
        const reader = new FileReader();
        
        
        reader.onload = async (e: any) => {
          try {
            
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = async () => {
              try {
                
                console.log('Image dimensions:', img.width, 'x', img.height);
                
                
                const size = Math.min(img.width, img.height);
                
               
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                  canvas.width = size;
                  canvas.height = size;
                  ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
                  
                  
                  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
                  
                  
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                     
                      console.log('Blob size:', blob.size);
                      
                    
                      const croppedFile = new File([blob], file.name, { type: 'image/png' });
                      
                      
                      console.log('Cropped file:', croppedFile);
                      
                     
                      const snapshot = await this.storage.upload(`userProfileImages/${croppedFile.name}`, croppedFile);
                     
                      const downloadURL = await snapshot.ref.getDownloadURL();
                      
                      
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
        
        
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
  

  async onFileSelected(event: any) {
    try {
      const file: File = event.target.files[0];
      
      
      this.userProfile.profileImageURL = 'assets/images/uploading.jpg';
      
      
      this.uploadImage(event);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
}
