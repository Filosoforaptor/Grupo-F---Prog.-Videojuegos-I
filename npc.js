class Npc extends Objeto {
  constructor(x, y, velMax, targetTint, juego) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    this.targetTint = targetTint;
    this.linea = new Linea(this.juego, this.targetTint, this.container);

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
          sprite.scale.set(2);
          sprite.anchor.set(0.5, 1);
        }
      });
  }

  cazarOvejaCercana() {
    let vecinos = this.obtenerVecinos(this.targetTint) // Buscamos las ovejas para cazar
    //console.log(vecinos);
    let targetDist = 99999;
    let currentTarget;

    function calcularDistancia(xLobo, yLobo, xOveja, yOveja) {
      //console.log(xLobo, yLobo, xOveja, yOveja)
      const dx = xOveja - xLobo;
      const dy = yOveja - yLobo;
      return Math.sqrt(dx * dx + dy * dy);
    }

    vecinos.forEach((oveja) => {
      if (oveja instanceof Oveja) {
        // Medimos la distancia 
        let newDist = calcularDistancia(this.container.x, this.container.y, oveja.container.x, oveja.container.y)
        if (newDist < targetDist) {
          targetDist = newDist;
          currentTarget = oveja;
        }
      }
    });
    console.log(currentTarget);
    if(currentTarget != undefined) {
        this.linea.drawLineToTarget(currentTarget.container.x, currentTarget.container.y);
    } 
    return currentTarget;
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
    const vecAtraccionMouse = this.atraccionATarget();
    //const vecAtraccionMouse = 0;
    //console.log("vec atrc " + vecAtraccionMouse);
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

  atraccionATarget() { // TOCA REWORKEARLA PARA QUE SIEMPRE SIGA 1 BURBUJA .... Y NO SOLO CUANDO ESTE EN LA MISMA CELDA
    // HACER FUNCION PROPIA Q REMPLAZE A BUSCAR VECINOS Y ESCANEE TODO en game.ovejas 
    let target = this.cazarOvejaCercana()
    //console.log(" TARGET: " + target );
    if (!target) return { x: 0, y: 0 }

    const vecMouse = new PIXI.Point(
      target.container.x - this.juego.app.stage.x - this.container.x,
      target.container.y - this.juego.app.stage.y - this.container.y
    );
    //console.log(vecMouse);
    //console.log("vec mouse");

    let distCuadrada = vecMouse.x ** 2 + vecMouse.y ** 2;

    if (distCuadrada < this.juego.grid.cellSize ** 2) return null;

    return {
      x: (vecMouse.x - this.velocidad.x) * 0.001,
      y: (vecMouse.y - this.velocidad.y) * 0.001,
    };
  }
}
