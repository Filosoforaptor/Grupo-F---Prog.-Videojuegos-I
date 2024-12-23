class Npc extends Objeto {
  constructor(x, y, velMax, targetTint, juego, spriteFile) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    this.targetTint = targetTint;
    this.linea = new Linea(this.juego, this.targetTint, this.container);
    //this.vecinos = [];
    this.contadorColisiones = 0;

    this.cargarVariosSpritesAnimadosDeUnSoloArchivo(
      {
        archivo: spriteFile, // Usar el parámetro spriteFile
        frameWidth: 130,
        frameHeight: 130,
        velocidad: velMax * 0.1,
        animaciones: {
          correrLado: { //
            desde: {
              x:22,
              y: 0,
            },
            hasta: {
              x: 27,
              y: 0,
            },
          },
          idle: { //
            desde: {
              x: 6,
              y: 0,
            },
            hasta: {
              x: 10,
              y: 0,
            },
          },
          correrArriba: { //
            desde: {
              x: 0,
              y: 0,
            },
            hasta: {
              x: 5,
              y: 0,
            },
          },
          correrAbajo: { //
            desde: {
              x: 11,
              y: 0,
            },
            hasta: {
              x: 16,
              y: 0,
            },
          },
          caminarLado: { //
            desde: {
              x: 22,
              y: 0,
            },
            hasta: {
              x: 27,
              y: 0,
            },
          },
          sentandoseLado: { //
            desde: {
              x: 17,
              y: 0,
            },
            hasta: {
              x: 21,
              y: 0,
            },
          },
        },
      },
      (animaciones) => {
        this.listo = true;
        this.cambiarSprite("idle");

        // Les cambio el tama;o para que sea mas grande.
        for (let sprite of Object.values(this.spritesAnimados)) {
          sprite.scale.set(0.6);
          sprite.anchor.set(0.5, 1);
        }
      });
  }

  cazarBurbujaCercana() {
    let vecinos = this.obtenerVecinos(this.targetTint, 8) // Buscamos las burbujas para cazar
    //console.log(vecinos);
    let targetDist = 99999;
    let currentTarget;

    function calcularDistancia(xPlayer, yPlayer, xBurbuja, yBurbuja) {
      //console.log(xPlayer, yPlayer, xBurbuja, yBurbuja)
      const dx = xBurbuja - xPlayer;
      const dy = yBurbuja - yPlayer;
      return Math.sqrt(dx * dx + dy * dy);
    }

    vecinos.forEach((burbuja) => {
      if (burbuja instanceof Burbuja) {
        // Medimos la distancia
        //console.log(burbuja); // Mirar array de children del objeto antes de que se rompe.
        let newDist = calcularDistancia(this.container.x, this.container.y, burbuja.container.x, burbuja.container.y)
        if (newDist < targetDist) {
          targetDist = newDist;
          currentTarget = burbuja;
        }
      }
    });
    //(currentTarget);
    /*if (currentTarget != undefined) {
      this.linea.drawLineToTarget(currentTarget.container.x, currentTarget.container.y);
    }*/
    return currentTarget;
  }

  update() {
    if (!this.listo) return;

    if (this.juego.contadorDeFrames % 4 == 1) {
      this.manejarSprites();
      this.detectarColisiones();
      //console.log((this.spritesAnimados[this.spriteActual]))
    }
    this.calcularYAplicarFuerzas();
    super.update();
  }

  // Función para detectar colisiones
  detectarColisiones() {
    let vecinos = this.obtenerVecinos(this.targetTint, 3)
    for (let i = vecinos.length - 1; i >= 0; i--) {
      // Ignoramos too lo que no sea burbuja.
      if (!(vecinos[i] instanceof Burbuja)) { continue; };

      let enemigo = vecinos[i];
      if (colisiona(this.spritesAnimados[this.spriteActual], enemigo.spritesAnimados[enemigo.spriteActual])) {
        let id = this.juego.gameContainer.getChildIndex(enemigo.container);
        // Sumamos 1 al Score
        this.contadorColisiones++;
        // Eliminamos el container
        eliminarContainerYHijos(enemigo.container, this.juego);
        // Eliminamos de la grid para el tracking al enemigo.
        this.juego.grid.remove(enemigo);
        // Eliminamos de la lista de burbujas.
        this.juego.burbujas.splice(this.juego.burbujas.indexOf(enemigo), 1);
        //vecinos.splice(i, 1);
        //console.log('Colisiones:' + this.id + " " + this.contadorColisiones);
      }
    }
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
    //EN FUERZAS VOY A SUMAR TODAS LAS FUERZAS Q FRAME A FRAME ACTUAN SOBRE EL DINOSAURIO
    let fuerzas = new PIXI.Point(0, 0);
    //ATRACCION A BURBUJA
    const vecAtraccionMouse = this.atraccionATarget();
    //console.log("Vector atraccion burbuja"); //
    //console.log(vecAtraccionMouse); //

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
    //console.log("Vector Final"); //
    //console.log(fuerzas.x, fuerzas.y); //
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

  atraccionATarget() {
    let target = this.cazarBurbujaCercana()
    //console.log(" TARGET: " + target );
    if (!target) return { x: 0, y: 0 }

    const vecMouse = new PIXI.Point(
      //target.container.x - this.juego.app.stage.x - this.container.x,
      //target.container.y - this.juego.app.stage.y - this.container.y
      target.container.x - this.container.x,
      target.container.y - this.container.y
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
