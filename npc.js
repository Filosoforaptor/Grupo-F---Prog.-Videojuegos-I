class Npc extends Objeto {
  constructor(x, y, velMax, targetTint, juego) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    this.targetTint = targetTint;

    this.cargarVariosSpritesAnimadosDeUnSoloArchivo(
      {
        archivo: "./img/npc/npc.png",
        frameWidth: 32,
        frameHeight: 32,
        velocidad: velMax * 0.1,
        animaciones: {
          correrLado: { //
            desde: {
              x: 0,
              y: 3,
            },
            hasta: {
              x: 2,
              y: 3,
            },
          },
          idle: { //
            desde: {
              x: 3,
              y: 5,
            },
            hasta: {
              x: 3,
              y: 5,
            },
          },
          correrArriba: { //
            desde: {
              x: 0,
              y: 1,
            },
            hasta: {
              x: 3,
              y: 1,
            },
          },
          correrAbajo: { //
            desde: {
              x: 0,
              y: 0,
            },
            hasta: {
              x: 3,
              y: 0,
            },
          },
          caminarLado: { //
            desde: {
              x: 0,
              y: 2,
            },
            hasta: {
              x: 3,
              y: 2,
            },
          },
          sentandoseLado: { //
            desde: {
              x: 0,
              y: 5,
            },
            hasta: {
              x: 3,
              y: 5,
            },
          },
        },
      },
      (animaciones) => {
        this.listo = true;
        this.cambiarSprite("idle");

        // Les cambio el tama;o para que sea mas grande.
        for (let sprite of Object.values(this.spritesAnimados)) {
          console.log("aaaaaa")
          sprite.scale.set(2);
          sprite.anchor.set(0.5, 1);
          console.log(this.spritesAnimados);
        }
      });
  }

  update() {
    if (!this.listo) return;

    if (this.juego.contadorDeFrames % 4 == 1) {
      this.manejarSprites();
    }
    this.calcularYAplicarFuerzas();
    super.update();
  }

  manejarSprites() {
    if (Math.abs(this.velocidad.x) < 0.3 && Math.abs(this.velocidad.y) < 0.3) {
      if (this.spriteActual != "idle") {
        this.cambiarSprite("sentandoseLado", 0, false, () => {
          this.cambiarSprite("idle");
        });
      }
    } else {
      this.calcularAngulo();
      this.ajustarSpriteSegunAngulo();
    }
    this.hacerQueLaVelocidadDeLaAnimacionCoincidaConLaVelocidad();
  }

  calcularYAplicarFuerzas() {
    //EN FUERZAS VOY A SUMAR TODAS LAS FUERZAS Q FRAME A FRAME ACTUAN SOBRE EL PERRITO
    let fuerzas = new PIXI.Point(0, 0);
    //ATRACCION AL MOUSE
    const vecAtraccionMouse = this.atraccionAlMouse();
    if (vecAtraccionMouse) {
      fuerzas.x += vecAtraccionMouse.x;
      fuerzas.y += vecAtraccionMouse.y;
    }

    const repulsionAObstaculos = this.repelerObstaculos(this.obtenerVecinos());
    if (repulsionAObstaculos) {
      fuerzas.x += repulsionAObstaculos.x;
      fuerzas.y += repulsionAObstaculos.y;
    }

    const bordes = this.ajustarPorBordes();
    fuerzas.x += bordes.x;
    fuerzas.y += bordes.y;
    this.fuerzas = fuerzas;
    this.aplicarFuerza(fuerzas);
  }

  ajustarSpriteSegunAngulo() {
    let velLineal = calculoDeDistanciaRapido(
      0,
      0,
      this.velocidad.x,
      this.velocidad.y
    );

    if (
      this.angulo >= 315 ||
      this.angulo <= 45 ||
      (this.angulo >= 135 && this.angulo <= 225)
    ) {
      //SI LA VELOCIDAD ES LA MITAD DE LA VELOCIDAD MAXIMA, CAMBIO AL SPRITE DE CAMINAR
      if (velLineal < this.velocidadMax * 0.5) {
        this.cambiarSprite("caminarLado");
      } else {
        this.cambiarSprite("correrLado");
      }
    } else if (this.angulo > 45 && this.angulo < 135) {
      this.cambiarSprite("correrArriba");
    } else if (this.angulo > 225 && this.angulo < 315) {
      this.cambiarSprite("correrAbajo");
    }
  }

  atraccionAlMouse() {
    if (!this.juego.mouse) return null;
    const vecMouse = new PIXI.Point(
      this.juego.mouse.x - this.juego.app.stage.x - this.container.x,
      this.juego.mouse.y - this.juego.app.stage.y - this.container.y
    );

    let distCuadrada = vecMouse.x ** 2 + vecMouse.y ** 2;

    if (distCuadrada < this.juego.grid.cellSize ** 2) return null;

    return {
      x: (vecMouse.x - this.velocidad.x) * 0.001,
      y: (vecMouse.y - this.velocidad.y) * 0.001,
    };
  }
}