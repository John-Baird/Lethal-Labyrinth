import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
// const fs = require('fs')
// require.extensions['.tsv'] = function (module, filename) {module.exports = fs.readFileSync(filename, 'utf8');};
// const levelString = require('./Dungeon_01.tsv')





@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  playerSpeed: number = 2;
  canvas: any;
  player: any;
  playerX: number = 100;
  playerY: number = 100;
  CurrentKey: any = {up:0,down:0,left:0,right:0}
  mapData: any;
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    
  ) {}


    



  private updateCanvas(): void {
    fetch('./assets/Dungeon_Sprites/Dungeon 01.tsv')  //TODO Find out how to link the tsv file
    .then(response => response.text())
    .then(data => {
      console.log(data);
      
      // Split the TSV data into rows
      const rows = data.split('\n');
      
      // Get the number of rows and columns
      const numCols = rows[0].split('\t').length;
      const numRows = rows.length;
      // Set the cell width and height
      const cellWidth = 21;
      const cellHeight = 21;
      // Set the canvas width and height based on the number of rows and columns
      const canvasWidth = numCols * cellWidth;
      const canvasHeight = numRows * cellHeight;
      // Get the canvas element
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      
      // Set the canvas width and height
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      // Get the 2D context
      const ctx = canvas.getContext('2d');

      let map = []
      // Loop through each row and column
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          // Get the value of the current cell
          const cellValue = rows[i].split('\t')[j];
          // Set the fill style to black if the cell is blank, or white if it has a value
          map.push(cellValue)
          if (cellValue === '') {
            ctx.fillStyle = 'black';
          } else {
            ctx.fillStyle = 'white';
          }
          // Fill the current cell
          ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
        }
      }
      this.mapData = map

      
    });
  }





  ngOnInit(): void {
    // Initialize canvas and player elements
    this.canvas = document.getElementById('canvas');
    this.player = document.getElementById('player');
    this.updateCanvas()
    // console.log(fetch('./assets/Dungeon_Sprites/Dungeon_01.tsv'))
    




    // Set up game loop
    setInterval(() => {
      this.update();
      this.draw();
      //this.savePosition();
    }, 16);


    
    // Handle user input
    document.addEventListener('keydown', (event) => {
      switch(event.key) {
        case 'ArrowUp':
          //this.playerY -= 10;
          this.CurrentKey.up = 1
          break;
        case 'ArrowDown':
          //this.playerY += 10;
          this.CurrentKey.down = -1
          break;
        case 'ArrowLeft':
          //this.playerX -= 10;
          this.CurrentKey.left = -1
          break;
        case 'ArrowRight':
          //this.playerX += 10; 
          this.CurrentKey.right = 1
          break;
      }
    });
    document.addEventListener('keyup', (event) => {
      switch(event.key) {
        case 'ArrowUp':
          //this.playerY -= 10;  
          if (this.CurrentKey.up === 1){
            this.CurrentKey.up = 0
          }
          break;
        case 'ArrowDown':
          //this.playerY += 10;
          if (this.CurrentKey.down === -1){
            this.CurrentKey.down = 0
          }
          break;
        case 'ArrowLeft':
          //this.playerX -= 10;
          if (this.CurrentKey.left === -1){
            this.CurrentKey.left = 0
          }
          break;
        case 'ArrowRight':
          //this.playerX += 10; 
          if (this.CurrentKey.right === 1){
            this.CurrentKey.right = 0
          } 
          break;
      }
    });
  }

  

  update(): void {
    // Update game logic here

    //Canvas
    const canvas = this.canvas
    const ctx = canvas.getContext('2d')

    const playerSize = 4
    const newPlayerX = this.playerX + (this.CurrentKey.left*playerSize + this.CurrentKey.right*playerSize) * this.playerSpeed;
    const newPlayerY = this.playerY - (this.CurrentKey.up*playerSize + this.CurrentKey.down*playerSize) * this.playerSpeed;


    //Future Tile
    function findTile(x,y,map){
      const rowIndex = Math.floor(y / 21)-3;
      const colIndex = Math.floor(x / 21);
      const currentIndex = colIndex+21*rowIndex
      const levelData = map
      const tile = levelData[currentIndex]
      return tile
    }
    
    const tile = {x:'',y:''}
    tile.x = findTile(newPlayerX,this.playerY,this.mapData)
    tile.y = findTile(this.playerX,newPlayerY,this.mapData)



    //Update Player
    if ( tile.x === 'F' || tile.x === 'DL' || tile.x === 'DB' || tile.x === 'DT' || tile.x === 'DPL'){
      this.playerX += (this.CurrentKey.left + this.CurrentKey.right) * this.playerSpeed
      
    }
    if ( tile.y === 'F' || tile.y === 'DL' || tile.y === 'DB' || tile.y === 'DT' || tile.y === 'DPL'){
      this.playerY -= (this.CurrentKey.up + this.CurrentKey.down) * this.playerSpeed
      
    }


    
  }





  
  draw(): void {
    // Clear canvas
    const ctx = this.canvas.getContext('2d');
    // this.updateCanvas()

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
