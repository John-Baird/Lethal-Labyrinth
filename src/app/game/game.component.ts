import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  playerSpeed: number = 2;
  lineLength: any;
  goal: any = {x:0,y:0};
  goalReset: any = false;
  level: any = 8;
  canvas: any;
  rayCanvas: any;
  floorTiles: any;
  player: any;
  playerX: number = 100;
  playerY: number = 100;
  CurrentKey: any = { up: 0, down: 0, left: 0, right: 0 };
  mapData: any;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
  ) {}

  ngOnInit(): void {
    this.rayCanvas = document.getElementById('raytrace');
    this.canvas = document.getElementById('canvas')
    this.player = document.getElementById('player');
    this.updateCanvas();

    setInterval(() => {
      this.update();
      
      this.draw();
    }, 16);

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.CurrentKey.up = 1;
          break;
        case 'ArrowDown':
          this.CurrentKey.down = -1;
          break;
        case 'ArrowLeft':
          this.CurrentKey.left = -1;
          break;
        case 'ArrowRight':
          this.CurrentKey.right = 1;
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          if (this.CurrentKey.up === 1) {
            this.CurrentKey.up = 0;
          }
          break;
        case 'ArrowDown':
          if (this.CurrentKey.down === -1) {
            this.CurrentKey.down = 0;
          }
          break;
        case 'ArrowLeft':
          if (this.CurrentKey.left === -1) {
            this.CurrentKey.left = 0;
          }
          break;
        case 'ArrowRight':
          if (this.CurrentKey.right === 1) {
            this.CurrentKey.right = 0;
          }
          break;
      }
    });
  }

  updateCanvas(): void {
    if (this.level > 10){
      this.level = 'Boss'
    }
    fetch(`./assets/Dungeon_Sprites/Dungeon ${this.level}.tsv`)
      .then(response => response.text())
      .then(data => {
        const rows = data.split('\n');
        const numCols = rows[0].split('\t').length;
        const numRows = rows.length;
        const cellWidth = 21;
        const cellHeight = 21;
        const canvasWidth = numCols * cellWidth;
        const canvasHeight = numRows * cellHeight;
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const rayCanvas = document.getElementById('raytrace') as HTMLCanvasElement;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        rayCanvas.width = canvasWidth;
        rayCanvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        let floortile = []
        let floortileX = []
        let floortileY = []
        let map = [];
        //let mapC = []
        //let C = 0
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            const cellValue = rows[i].split('\t')[j];
            map.push(cellValue);
            //C++
            //mapC.push(`${cellValue}+${C-1}`)
            
            if (cellValue === '') {
              ctx.fillStyle = 'black';
            } else {
              ctx.fillStyle = 'white';
              ///Find index of cellvalue  
              //console.log(mapC.indexOf(`${cellValue}+${C-1}`))
              //floortile.push(mapC.indexOf(`${cellValue}+${C-1}`))
              floortile.push({x:j,y:i})
              floortileX.push(j)
              floortileY.push(i)
            }
            ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
          }
        }
        let a
        if(this.level >= 10 || this.level == "Boss"){
           a = "Boss"
           console.log("boss room time")
        }
        else{
          a = this.level+1 
        }
        console.log(`a is ${a} and ${typeof(a)}`)
      fetch(`./assets/Dungeon_Sprites/Dungeon ${a}.tsv`)
      .then(response => response.text())
      .then(data => {
        const Nrows = data.split('\n');
        const NnumCols = Nrows[0].split('\t').length;
        const NnumRows = Nrows.length;
        let Nfloortile = []
        let Nmap = [];
        //let mapC = []
        //let C = 0
        for (let i = 0; i < NnumRows; i++) {
          for (let j = 0; j < NnumCols; j++) {
            const NcellValue = Nrows[i].split('\t')[j];
            Nmap.push(NcellValue);
            //C++
            //mapC.push(`${cellValue}+${C-1}`)
            
            if (NcellValue === '') {
              //ctx.fillStyle = 'black';
            } else {
              //ctx.fillStyle = 'white';
              ///Find index of cellvalue  
              //console.log(mapC.indexOf(`${cellValue}+${C-1}`))
              //floortile.push(mapC.indexOf(`${cellValue}+${C-1}`))
              Nfloortile.push({x:j,y:i})
              
            }
            //ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
          }
        }
        let TrueFloor = []
        console.log(Nfloortile.length)
        console.log(floortile.length)
        
        for (let i = 0; i< Nfloortile.length; i++){
          for(let j = 0; j < floortile.length; j++){
            //console.log(`${Nfloortile[i]} & ${floortile[j]}`)
            if (Nfloortile[i].x === floortile[j].x){
              if(Nfloortile[i].y === floortile[j].y){
                TrueFloor.push(Nfloortile[i])
                
              }
              
            }
          }
        }
        //console.log(TrueFloor)
        let exit = Math.floor(Math.random()*TrueFloor.length)
        ctx.fillStyle = 'yellow'
        //console.log(exit)
        ctx.fillRect(TrueFloor[exit].x*21,TrueFloor[exit].y*21,cellWidth,cellHeight)
        this.goal.x = TrueFloor[exit].x
        this.goal.y = TrueFloor[exit].y
        console.log(this.goal)
        this.goalReset = true
        this.mapData = map 
      })
      

      });
  }

  update(): void {
    if(Math.floor(this.playerX/21) === this.goal.x && Math.floor(this.playerY/21)-3 === this.goal.y){
      if(this.goalReset === true){
        if(this.level <= 10){
          this.level++
        }
        
        this.goalReset = false
        this.updateCanvas()
      }
      
    }
    const canvas = this.rayCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const playerSize = 4;
    const newPlayerX =
      this.playerX +
      (this.CurrentKey.left * playerSize + this.CurrentKey.right * playerSize) *
        this.playerSpeed;
    const newPlayerY =
      this.playerY -
      (this.CurrentKey.up * playerSize + this.CurrentKey.down * playerSize) *
        this.playerSpeed;

    const keymap = this.mapData;

    function findTile(x, y, map) {
      const rowIndex = Math.floor(y / 21) - 3;
      const colIndex = Math.floor(x / 21);
      const currentIndex = colIndex + 21 * rowIndex;
      const levelData = map;
      const tile = levelData[currentIndex];
      return tile;
    }

    const tile = { x: '', y: '' };
    tile.x = findTile(newPlayerX, this.playerY, this.mapData);
    tile.y = findTile(this.playerX, newPlayerY, this.mapData);
    //console.log(Math.floor(this.playerX/21))
    
    if (
      tile.x === 'F' ||
      tile.x === 'DL' ||
      tile.x === 'DB' ||
      tile.x === 'DT' ||
      tile.x === 'DPL'||
      tile.x === 'DPT'||
      tile.x === 'DPB'||
      tile.x === 'DPR'||
      tile.x === 'DR'
    ) {
      this.playerX += (this.CurrentKey.left + this.CurrentKey.right) * this.playerSpeed;
    }
    if (
      tile.y === 'F' ||
      tile.y === 'DL' ||
      tile.y === 'DB' ||
      tile.y === 'DT' ||
      tile.y === 'DPL'||
      tile.y === 'DPT'||
      tile.y === 'DPB'||
      tile.y === 'DPR'||
      tile.y === 'DR'
    ) {
      this.playerY -= (this.CurrentKey.up + this.CurrentKey.down) * this.playerSpeed;
    }

    const lineThickness = 1;
    const lineDensity = 1650;

    let type = 'outside';

    if (type === 'inside') {
      for (let angle = 0; angle <= 360; angle += 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);

        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);

        ctx.beginPath();
        ctx.moveTo(this.playerX, this.playerY - 60);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = 'red';
        ctx.stroke();
      }
    }
    if (type === 'outside') {
      ctx.beginPath();
      //ctx.moveTo(this.playerX, this.playerY - 60);
      for (let angle = 0; angle <= 360; angle += 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);

        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);

        ctx.lineTo(endX, endY);
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = 'red';
      }
      ctx.stroke();
    }
    if (type === 'fill') {
      ctx.beginPath();
      ctx.fillStyle = 'black'; // Set the fill color to black
    
      for (let angle = 0; angle <= 360; angle += 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);
    
        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);
    
        ctx.lineTo(endX, endY);
      }
    
      // Close the shape
      ctx.lineTo(this.playerX, this.playerY - 60);
      ctx.closePath();
    
      ctx.fill(); // Fill the shape with black
    }
    if (type === 'reverse1') {
      ctx.beginPath();
      //ctx.moveTo(this.playerX, this.playerY - 60);
      ctx.fillStyle = 'black';
      //let firstline = calculateLineLength(this.playerX, this.playerY, 0)
      
      
      // ctx.lineTo(0,0)
      // ctx.lineTo(0,canvas.height)
      // ctx.lineTo(canvas.width,this.playerY-60)
      // ctx.lineTo(canvas.width,canvas.height)
      // ctx.lineTo(canvas.width,0)
      // ctx.lineTo(canvas.width,canvas.height)
      // ctx.lineTo(0,0)
      // ctx.lineTo(0,canvas.height)
      // ctx.lineTo(canvas.width,this.playerY-60)
      //ctx.lineTo(this.playerX+firstline+1,this.playerY)
      ctx.lineTo(canvas.width,this.playerY-60)
      // ctx.lineTo(0,0)
      for (let angle = 0; angle <= 360; angle += 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);
        this.lineLength+= 0
        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);

        ctx.lineTo(endX, endY);
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = 'black';
      }
      for (let angle = 360; angle >= 0; angle -= 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);
        this.lineLength+= 2000
        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);

        ctx.lineTo(endX, endY);
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = 'black';
      }
      // ctx.lineTo(0,0)
      // ctx.lineTo(canvas.width,0)
      // ctx.lineTo(canvas.width,canvas.height)
      // ctx.lineTo(0,canvas.height)
      // ctx.lineTo(0,0)
      //ctx.lineTo(canvas.width,this.playerY-10)
      ctx.stroke();
      ctx.fill()
    }
    if (type === 'reverse2') {
      ctx.beginPath();
      //ctx.moveTo(this.playerX, this.playerY - 60);
      ctx.fillStyle = 'brown';
      let firstline = calculateLineLength(this.playerX, this.playerY, 0)
      //ctx.lineTo(this.playerX+firstline,this.playerY)
      ctx.lineTo(0,0)
      ctx.lineTo(0,canvas.height)
      ctx.lineTo(canvas.width,canvas.height)
      ctx.lineTo(canvas.width,0)
      ctx.lineTo(0,0)
      
      
      // ctx.lineTo(0,0)
      for (let angle = 0; angle <= 360; angle += 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);
        this.lineLength+= 15
        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);

        ctx.lineTo(endX, endY);
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = 'red';
      }
      // ctx.lineTo(0,0)
      // ctx.lineTo(canvas.width,0)
      // ctx.lineTo(canvas.width,canvas.height)
      // ctx.lineTo(0,canvas.height)
      // ctx.lineTo(0,0)
      
      //ctx.stroke();
      ctx.fill()
    }
    if (type === 'reverse3') {
      ctx.beginPath();
      //ctx.moveTo(this.playerX, this.playerY - 60);
      ctx.fillStyle = 'brown';
      let firstline = calculateLineLength(this.playerX, this.playerY, 0)
      //ctx.lineTo(this.playerX+firstline,this.playerY)
      ctx.lineTo(0,0)
      ctx.lineTo(0,canvas.height)
      ctx.lineTo(canvas.width,canvas.height)
      ctx.lineTo(canvas.width,0)
      ctx.lineTo(0,0)
      
      
      // ctx.lineTo(0,0)
      for (let angle = 0; angle <= 360; angle += 360 / lineDensity) {
        const radians = (angle * Math.PI) / 180;
        this.lineLength = calculateLineLength(this.playerX, this.playerY, radians);
        //this.lineLength+= 20
        const endX = this.playerX + this.lineLength * Math.cos(radians);
        const endY = this.playerY - 60 + this.lineLength * Math.sin(radians);

        ctx.lineTo(endX, endY);
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = 'black';
      }
      // ctx.lineTo(0,0)
      // ctx.lineTo(canvas.width,0)
      // ctx.lineTo(canvas.width,canvas.height)
      // ctx.lineTo(0,canvas.height)
      // ctx.lineTo(0,0)
      
      ctx.stroke();
      ctx.fill()
    }

    function calculateLineLength(x, y, radians) {
      let lineLength = 0;
      let a = 0;
      let cx = x;
      let cy = y;
      
      let btile = findTile(cx, cy, keymap);
      while (
        btile === 'F' ||
        btile === 'DL' ||
        btile === 'DB' ||
        btile === 'DT' ||
        btile === 'DPL'||
        btile === 'DPT'||
        btile === 'DPB'||
        btile === 'DPR'||
        btile === 'DR'
      ) {
        btile = findTile(cx + a * Math.cos(radians), cy + a * Math.sin(radians), keymap);
        a++;
      }     
      
      //console.log(b)
      return lineLength + a;
    }

  }

  draw(): void {
    const ctx = this.rayCanvas.getContext('2d');

    this.player.style.left = this.playerX + 'px';
    this.player.style.top = this.playerY + 'px';
  }

  savePosition(): void {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        const positionDocRef = this.firestore.collection('positions').doc(user.uid);
        positionDocRef.set({
          x: this.playerX,
          y: this.playerY,
        });
      }
    });
  }
}