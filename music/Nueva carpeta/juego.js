// Clase Juego
class Juego {
  constructor() {
    this.canvasWidth = window.innerWidth * 2;
    this.canvasHeight = window.innerHeight * 2;
    this.app = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeight,
      resizeTo: window,
      backgroundColor: 0x1099bb,
    });
    document.body.appendChild(this.app.view);

    // Creo los contenedores.
    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.uiContainer);

    this.gridActualizacionIntervalo = 10; // Cada 10 frames
    this.contadorDeFrames = 0;
    this.grid = new Grid(50, this); // Tamaño de celda 50
    this.burbujas = [];
    this.obstaculos = [];
    this.jabones = [];

    this.app.stage.sortableChildren = true;
    this.gameContainer.sortableChildren = true;
    this.ui = new UI(this);

    this.ponerFondo();

    this.ponerJabones(20);
    this.ponerProtagonista();
    this.ponerNPCs();
    this.ponerJuguetes(20);

    this.ponerBurbujas(165, 0xFF0000); //500 rojo  0xFF0000
    this.ponerBurbujas(165, 0x00FF00); //500 verde
    this.ponerBurbujas(165, 0x0000FF); //500 azul

    // 0xFFFFFF es transparente.

    //this.ponerPastos(1000);

    // -------- FILTROS  --------  //
    //this.prenderFiltroASCII(8);
    //this.prenderFiltroPixel(4); //4

    this.ponerListeners();
    
    PIXI.Loader.shared.load((loader, resources) => {
      loader.callbacks.forEach(cb => cb(loader, resources));
    });

    setTimeout(() => {
      this.app.ticker.add(this.actualizar.bind(this));
      window.__PIXI_APP__ = this.app;
    }, 100); 
  }
/*
  ponerPastos(cant) {
    for (let i = 0; i < cant; i++) {
      this.decorados.push(
        new Pasto(
          Math.random() * this.canvasWidth,
          Math.random() * this.canvasHeight,
          this
        )
      );
    }
  }*/

  ponerFondo() {
    // Crear un patrón a partir de una imagen
    PIXI.Texture.fromURL("./img/bg2.png").then((patternTexture) => {
      // Crear un sprite con la textura del patrón
      this.backgroundSprite = new PIXI.TilingSprite(patternTexture, 5000, 5000);
      //this.backgroundSprite.zIndex = -500000;

      // Añadir el sprite al stage
      //this.backgroundSprite.zIndex = -50;
      this.gameContainer.addChildAt(this.backgroundSprite, 0);

      // ---------------- FILTRO  AGUA ----------------------
      // Crear una textura de desplazamiento
      const displacementSprite = PIXI.Sprite.from('displacement.png');
      displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
      this.gameContainer.addChildAt(displacementSprite, 1);

      // Crear y aplicar el filtro de desplazamiento
      const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
      this.backgroundSprite.filters = [displacementFilter];
      // Peque;o blur al fondo
      //this.prenderFiltroBlur(1, this.backgroundSprite);

      // Animar el filtro para simular el efecto de agua
      this.app.ticker.add((delta) => {
        displacementSprite.x += 1 * delta;
        displacementSprite.y += 1 * delta;
      });

    });
  }

  ponerProtagonista() {
    this.player = new Player(
      window.innerWidth / 2,
      window.innerHeight * 0.9,
      5,
      this
    );
  }

  ponerNPCs() {
    this.npc1 = new Npc(
      window.innerWidth / 3,
      window.innerHeight * 0.5,
      5,
      0x0000FF,
      this,
      "./img/npc/npc1.png" // Ruta del sprite para npc1
    );
    this.npc2 = new Npc(
      window.innerWidth / 1.5,
      window.innerHeight * 0.5,
      5,
      0xFF0000,
      this,
      "./img/npc/npc2.png" // Ruta del sprite para npc2
    );
  }

  ponerJuguetes(cant) {
    const radio = 400; // Radio de verificación en píxeles para que no spawneen uno arriba de otro.

    for (let i = 0; i < cant; i++) {
      let x, y, colision;

      do {
        x = Math.random() * this.canvasWidth;
        y = Math.random() * this.canvasHeight;
        colision = false;

        for (let obstaculo of this.obstaculos) {
          //console.log(obstaculo);
          const distancia = calculoDeDistancia(obstaculo.container.x, obstaculo.container.y, x, y);
          //console.log(obstaculo.container.x, obstaculo.container.y, x, y, distancia);

          if (distancia < radio) {
            colision = true;
            break;
          }
        }
      } while (colision);

      this.obstaculos.push(new Juguete(x, y, this));
    }
  }


  ponerJabones(cant) {
    for (let i = 0; i < cant; i++) {
      this.jabones.push(
        new Jabon(
          Math.random() * this.canvasWidth,
          Math.random() * this.canvasHeight,
          this
        )
      );
    }
  }

  removeJabon(jabon) {
    const index = this.jabones.indexOf(jabon);
    if (index > -1) {
      this.jabones.splice(index, 1);
    }
  }

  ponerBurbujas(cant, tint) {
    // Crear algunos burbujas
    for (let i = 0; i < cant; i++) {
      //LA VELOCIDAD SE USA PARA LA VELOCIDAD MAXIMA CON LA Q SE MUEVE LA BURBUJA
      //Y TAMBIEN PARA LA VELOCIDAD DE REPRODUCCION DE UN SPRITE
      let velocidad = Math.random() * 1.3 + 1.5;
      const burbuja = new Burbuja(
        Math.random() * this.canvasWidth,
        Math.random() * this.canvasHeight,
        velocidad,
        tint,
        this
      ); // Pasar la grid a los burbujas
      this.burbujas.push(burbuja);
      this.grid.add(burbuja);
    }
  }

  ponerListeners() {
    // Sirven para mover el dinobebe.
    this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.app.view.addEventListener("mouseleave", () => {
      this.mouse = null;
    });
    window.addEventListener("resize", () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });
  }

  // Actualizar la posición del mouse
  onMouseMove(event) {
    this.mouse = { x: 0, y: 0 };
    const rect = this.app.view.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  actualizar() {
    // Lógica de actualización del juego
    this.contadorDeFrames++;

    // Otras actualizaciones del juego
    this.ui.update();
    this.player.update();
    this.npc1.update();
    this.npc2.update();

    this.burbujas.forEach((burbuja) => {
      burbuja.update();
    });

    this.obstaculos.forEach((juguete) => {
      juguete.update();
    });

    this.moverCamara();
  }

  moverCamara() {
    let lerpFactor = 0.05;
    // Obtener la posición del protagonista
    const playerX = this.player.container.x;
    const playerY = this.player.container.y;

    // Calcular la posición objetivo del stage para centrar al protagonista
    const halfScreenWidth = this.app.screen.width / 2;
    const halfScreenHeight = this.app.screen.height / 2;

    const targetX = halfScreenWidth - playerX;
    const targetY = halfScreenHeight - playerY;

    // Aplicar el límite de 0,0 y canvasWidth, canvasHeight
    const clampedX = Math.min(
      Math.max(targetX, -(this.canvasWidth - this.app.screen.width)),
      0
    );
    const clampedY = Math.min(
      Math.max(targetY, -(this.canvasHeight - this.app.screen.height)),
      0
    );

    // Movemos el game container.
    this.gameContainer.x = lerp(
      this.gameContainer.x,
      clampedX,
      lerpFactor
    );
    this.gameContainer.y = lerp(
      this.gameContainer.y,
      clampedY,
      lerpFactor
    );
  }

  prenderFiltroASCII(sizeAscii) {
    // Crear y aplicar el filtro ASCII
    const asciiFilter = new PIXI.filters.AsciiFilter();
    this.gameContainer.filters = [asciiFilter];
    // Configurar los parámetros del filtro
    asciiFilter.size = sizeAscii; // Ajusta el tamaño de los caracteres ASCII

    /*   // CODIGO SECRETO QUE NO RECOMIENDO ACTIVAR XD 
    let increment = true; // Dirección del cambio
    this.app.ticker.add((delta) => {

      // Ajustar la variable
      if (increment) {
        asciiFilter.size += delta * 0.1;  // Ajustar la velocidad de cambio
        if (asciiFilter.size >= 20) increment = false;
      } else {
        asciiFilter.size -= delta * 0.1;
        if (asciiFilter.size <= 8) increment = true;
      }

    }); */
  }

  prenderFiltroPixel(sizePixels) {
    // Crear y aplicar el filtro Pixelador
    const pixelateFilter = new PIXI.filters.PixelateFilter();
    // Configurar los parámetros del filtro
    pixelateFilter.size = sizePixels; // Ajusta el tamaño de los pixeles
    this.gameContainer.filters = [pixelateFilter];
  }

  prenderFiltroBlur(sizeBlur, target) {
    // Crear y aplicar el filtro Blue
    const blurFilter = new PIXI.filters.BlurFilter();
    // Configurar los parámetros del filtro
    blurFilter.size = sizeBlur; // Ajusta el tamaño de los pixeles
    blurFilter.quality = 10
    target.filters.push(blurFilter);
  }

  // CODIGO GAME OVER
  StartEndScreen(winner) {
    // Le pasamos el winner para iniciar el texto de la end screen.
    this.app.destroy(true);
    // Creamos la app de creditos.
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1099bb
    });
    document.body.appendChild(this.app.view);

    // Crear el elemento de video
    let videoElement = document.createElement('video');
    videoElement.src = './video/patitos.mp4';
    videoElement.loop = true;
    videoElement.muted = true;

    // Esperar a que el video esté listo para reproducirse
    videoElement.addEventListener('canplaythrough', () => {
      videoElement.play();

      // Crear la textura del video
      let videoTexture = PIXI.Texture.from(videoElement);

      // Crear el sprite del video
      let videoSprite = new PIXI.Sprite(videoTexture);
      videoSprite.width = this.app.screen.width;
      videoSprite.height = this.app.screen.height;

      // Añadir el sprite del video al escenario
      this.app.stage.addChild(videoSprite);

      // Creo la imagen del jabon UI
      // Me fijo que jabon elegir segun el ganador.
      let url = "";
      switch (winner) {
        case "2":
          url += "jabonA.png";
          break;
        case "1":
          url += "jabonB.png";
          break;
        case "P":
          url += "jabonD.png";
          break;
        default:
          console.log("ERROR WINNER IS INVALID: ", winner);
          url += "jabonUI1.png";
          break;
      }
      this.jabonUI = PIXI.Sprite.from('./img/' + url);
      this.jabonUI.anchor.set(0.5);
      let xUIJabon = (this.app.screen.width / 2);
      let yUIJabon = (this.app.screen.height / 2);
      this.jabonUI.position.set(xUIJabon, yUIJabon);
      this.app.stage.addChild(this.jabonUI);

      const escala = 0.5;
      this.jabonUI.scale.set(escala); // ESCALA DEL TAMA:O DE LA IMAGEN DEL JABON . MAX 1 - 100%.

      // Función para redimensionar el canvas y los sprites
      const resizeGO = () => {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        videoSprite.width = this.app.screen.width;
        videoSprite.height = this.app.screen.height;;

        this.jabonUI.position.set((this.app.screen.width / 2), (this.app.screen.height / 2));
      }

      // Para arreglar lo del tama;o si cambia.
      window.addEventListener("resize", resizeGO);
    });
  }
}

function StartGame() {
  return new Juego();
}