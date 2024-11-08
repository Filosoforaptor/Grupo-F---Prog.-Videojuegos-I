// Clase Juego
class Juego {
  constructor() {
    this.pausa = false;
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
    this.ovejas = [];
    this.balas = [];
    this.obstaculos = [];
    this.jabones = [];
    this.decorados = [];

    this.keyboard = {};

    this.app.stage.sortableChildren = true;
    this.ui = new UI(this);

    this.ponerFondo();

    this.ponerJabones(20);
    this.ponerProtagonista();
    this.ponerPiedras(20);


    this.ponerNPCs();

    this.ponerOvejas(165, 0xFF0000); //500 rojo  0xFF0000
    this.ponerOvejas(165, 0x00FF00); //500 verde
    this.ponerOvejas(165, 0x0000FF); //500 azul

    // 0xFFFFFF es transparente.

    //this.ponerPastos(1000);

    // -------- FILTROS  --------  //
    //this.prenderFiltroASCII(8);
    //this.prenderFiltroPixel(4)

    this.ponerListeners();

    PIXI.Loader.shared.load((loader, resources) => {
      loader.callbacks.forEach(cb => cb(loader, resources));
    });

    setTimeout(() => {
      this.app.ticker.add(this.actualizar.bind(this));
      window.__PIXI_APP__ = this.app;
    }, 100);
  }

  hacerCosasParaQSeVeaPixelado() {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app.view.style.imageRendering = 'pixelated';
    PIXI.settings.ROUND_PIXELS = true;
  }

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
  }

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
      this
    );
    this.npc2 = new Npc(
      window.innerWidth / 1.5,
      window.innerHeight * 0.5,
      5,
      0xFF0000,
      this
    );
  }

  ponerPiedras(cant) {
    for (let i = 0; i < cant; i++) {
      this.obstaculos.push(
        new Piedra(
          Math.random() * this.canvasWidth,
          Math.random() * this.canvasHeight,
          this
        )
      );
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

  ponerOvejas(cant, tint) {
    // Crear algunos ovejas
    for (let i = 0; i < cant; i++) {
      //LA VELOCIDAD SE USA PARA LA VELOCIDAD MAXIMA CON LA Q SE MUEVE EL ZOMBIE
      //Y TAMBIEN PARA LA VELOCIDAD DE REPRODUCCION DE UN SPRITE
      let velocidad = Math.random() * 1.3 + 1.5;
      const oveja = new Oveja(
        Math.random() * this.canvasWidth,
        Math.random() * this.canvasHeight,
        velocidad,
        tint,
        this
      ); // Pasar la grid a los ovejas
      this.ovejas.push(oveja);
      this.grid.add(oveja);
    }
  }

  mouseDownEvent() { }

  ponerListeners() {
    // Manejar eventos del mouse
    this.app.view.addEventListener("mousedown", () => {
      (this.mouse || {}).click = true;
      this.mouseDownEvent();
    });
    this.app.view.addEventListener("mouseup", () => {
      (this.mouse || {}).click = false;
    });

    this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.app.view.addEventListener("mouseleave", () => {
      this.mouse = null;
    });
    window.addEventListener("resize", () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("keydown", (e) => {
      this.keyboard[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      delete this.keyboard[e.key.toLowerCase()];
    });
  }

  // Actualizar la posición del mouse
  onMouseMove(event) {
    this.mouse = { x: 0, y: 0 };
    const rect = this.app.view.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
  pausar() {
    this.pausa = !this.pausa;
  }

  actualizar() {
    if (this.pausa) return;
    this.contadorDeFrames++;

    this.ui.update();
    this.player.update();
    this.npc1.update();
    this.npc2.update();


    // AGREGAR UPDATE NPCS !!

    this.ovejas.forEach((oveja) => {
      oveja.update();
    });
    this.balas.forEach((bala) => {
      bala.update();
    });

    this.decorados.forEach((decorado) => {
      decorado.update();
    });

    this.obstaculos.forEach((piedra) => {
      piedra.update();
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

    // Aplicar Lerp para suavizar el movimiento de la cámara
    // ARREGLA LA CAMARA PERO SE ROMPE el movimiento del pj*
    /*
    this.gameContainer.x += (clampedX - this.gameContainer.x) * lerpFactor;
    this.gameContainer.y += (clampedY - this.gameContainer.y) * lerpFactor;
    */

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

    // Cargar la imagen de fondo
    PIXI.Loader.shared
      .add('fondoEndScreen', 'endscreen.png')
      .load((loader, resources) => {
        // Crear sprites para cada imagen cargada
        const fondo = new PIXI.Sprite(resources.fondoEndScreen.texture);
        fondo.width = this.app.screen.width;
        fondo.height = this.app.screen.height;
        // Añadir los sprites al escenario
        this.app.stage.addChild(fondo);

        // Agrego texto de ganador centrado.
        this.winnerText = new PIXI.Text(winner, { fontFamily: 'fuente', fontSize: 50, fill: 0xFF0000, padding: 20 });
        let xPos = (this.app.screen.width - this.winnerText.width) / 2;
        let yPos = (this.app.screen.height - this.winnerText.height) / 2;
        this.winnerText.position.set(xPos, yPos);
        this.app.stage.addChild(this.winnerText);


        // Función para redimensionar el canvas y los sprites
        const resizeGO = () => {
          this.app.renderer.resize(window.innerWidth, window.innerHeight);
          fondo.width = this.app.screen.width;
          fondo.height = this.app.screen.height;;

          this.winnerText.x = (this.app.screen.width - this.winnerText.width) / 2;
          this.winnerText.y = (this.app.screen.height - this.winnerText.height) / 2;
        }

        // Para arreglar lo del tama;o si cambia.
        window.addEventListener("resize", resizeGO);
      });
  }
}

function StartGame() {
  return new Juego();
}


// https://github.com/brotochola/clases_hurlingham/tree/main/clase6
// https://github.com/brotochola/clases_hurlingham/tree/main/clase5