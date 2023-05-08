import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';





@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
 
  canvas: any;
  player: any;
  playerX: number = 50;
  playerY: number = 50;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    
  ) {}


    









  ngOnInit(): void {
    // Initialize canvas and player elements
    this.canvas = document.getElementById('canvas');
    this.player = document.getElementById('player');

    



    // Set up game loop
    setInterval(() => {
      this.update();
      this.draw();
      this.savePosition();
    }, 16);

    // Handle user input
    document.addEventListener('keydown', (event) => {
      switch(event.key) {
        case 'ArrowUp':
          this.playerY -= 10;
          break;
        case 'ArrowDown':
          this.playerY += 10;
          break;
        case 'ArrowLeft':
          this.playerX -= 10;
          break;
        case 'ArrowRight':
          this.playerX += 10; 
          break;
      }
    });
  }

  

  update(): void {
    // Update game logic here
  }

  draw(): void {
    // Clear canvas
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw player
    this.player.style.left = this.playerX + 'px';
    this.player.style.top = this.playerY + 'px';
  }

  savePosition(): void {
    // Save player position to Firestore
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const positionDocRef = this.firestore.collection('positions').doc(user.uid);
        positionDocRef.set({
          x: this.playerX,
          y: this.playerY
        });
      }
    });
  }

}