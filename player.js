class Player extends Objeto {
  constructor(x, y, velMax, juego) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    this.contadorColisiones = 0;
    this.targetTint = 0x00FF00;
    // Para maquina de estados que maneja power ups
    this.estados = { NORMAL: 0, JABONOSO: 1 };
    this.estado = this.estados.NORMAL;
    this.duracionPowerUp = 60;//  EN FRAMES
    this.potenciaPowerUp = 8; // 5 es el normal. RECOMIENDO 8 o 10.
    this.timer = this.duracionPowerUp;
    this.container.zIndex = 10;

    // Variable para almacenar la cantidad de jabones recogidos
    this.jabonesRecogidos = 0; 

    // Evento para detectar el clic del mouse
    window.addEventListener('click', (event) => {
      if (event.button === 0) { // Botón izquierdo del mouse
        this.usarJabon();
      }
    });

    this.cargarSpriteSheetAnimadoDeJSON("./img/perro/perro.json", (e) => {
      this.listo = true;
      this.cambiarSprite("correrLado");
      for (let sprite of Object.values(this.spritesAnimados)) {
        sprite.scale.set(2);
        sprite.anchor.set(0.5, 1);
      }
    });
  }

  update() {
    if (!this.listo) return;

    if (this.juego.contadorDeFrames % 4 == 1) {
      this.manejarSprites();
      this.detectarColisiones();
      this.detectarColisionesJabones();
    }
    this.hacerCosasSegunEstado();
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
      //console.log(enemigo);
      //console.log("Clase de la colision: " + enemigo.constructor.name);
      if (colisiona(this.spritesAnimados[this.spriteActual], enemigo.spritesAnimados[enemigo.spriteActual])) {
        // Sumamos 1 al Score
        this.contadorColisiones++;
        // Eliminamos el container
        eliminarContainerYHijos(enemigo.container, this.juego);
        // Eliminamos de la grid para el tracking al enemigo.
        this.juego.grid.remove(enemigo);
        // Eliminamos de la lista de burbujas.
        this.juego.burbujas.splice(this.juego.burbujas.indexOf(enemigo), 1);
        //vecinos.splice(i, 1);
        //console.log('Colisiones Player: ' + this.contadorColisiones);
      }
    }
  }
  // Método para usar el jabón guardado
  usarJabon() {
    if (this.jabonesRecogidos > 0) {
      this.jabonesRecogidos -= 1;
      this.estado = this.estados.JABONOSO;
      this.timer = this.duracionPowerUp;
      console.log("Usaste un jabón! Jabones restantes: " + this.jabonesRecogidos);
    }
  }
  detectarColisionesJabones() {
    this.juego.jabones.forEach(jabon => {
      if (colisiona(this.spritesAnimados[this.spriteActual], jabon.sprite) && this.estado == this.estados.NORMAL) {
        console.log("Colisión detectada con un jabón!");

        // Manejar la colisión
        jabon.onCollision(this);
      }
    });
  }

  hacerCosasSegunEstado() {
    // SI EL PLAYER TOCO UN JABON
    if (this.estado == this.estados.JABONOSO) {
      this.velocidadMax = this.potenciaPowerUp;
      this.timer--;
      // Si se acaba el timer, cambiamos el estado a NORMAL.
      if (this.timer == 0) {
        this.timer = this.duracionPowerUp;
        this.estado = this.estados.NORMAL;
        this.velocidadMax = 5;
        console.log("Se acabo power up!");
        return;
      }
    }
    // ACA PODRIAN IR MAS POSIBLES ESTADOS QUE NO TENEMOS
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

    // Obtener la posición del mouse ajustada al contenedor del juego
    const vecMouse = new PIXI.Point(
      this.juego.mouse.x - this.juego.gameContainer.x - this.container.x,
      this.juego.mouse.y - this.juego.gameContainer.y - this.container.y
    );

    let distCuadrada = vecMouse.x ** 2 + vecMouse.y ** 2;

    if (distCuadrada < this.juego.grid.cellSize ** 2) return null;

    return {
      x: (vecMouse.x - this.velocidad.x) * 0.001,
      y: (vecMouse.y - this.velocidad.y) * 0.001,
    };
  }
}
