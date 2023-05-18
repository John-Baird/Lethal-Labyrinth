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
  canvas: any;
  rayCanvas: any;
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
    fetch('./assets/Dungeon_Sprites/Dungeon 01.tsv')
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

        let map = [];
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            const cellValue = rows[i].split('\t')[j];
            map.push(cellValue);
            if (cellValue === '') {
              ctx.fillStyle = 'black';
            } else {
              ctx.fillStyle = 'white';
            }
            ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
          }
        }
        this.mapData = map;
      });
  }

  update(): void {
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

    if (
      tile.x === 'F' ||
      tile.x === 'DL' ||
      tile.x === 'DB' ||
      tile.x === 'DT' ||
      tile.x === 'DPL'
    ) {
      this.playerX += (this.CurrentKey.left + this.CurrentKey.right) * this.playerSpeed;
    }
    if (
      tile.y === 'F' ||
      tile.y === 'DL' ||
      tile.y === 'DB' ||
      tile.y === 'DT' ||
      tile.y === 'DPL'
    ) {
      this.playerY -= (this.CurrentKey.up + this.CurrentKey.down) * this.playerSpeed;
    }

    const lineThickness = 2;
    const lineDensity = 1200;

    let type = 'inside';

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
        btile === 'DPL'
      ) {
        btile = findTile(cx + a * Math.cos(radians), cy + a * Math.sin(radians), keymap);
        a++;
      }

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