class Npc extends Objeto {
  constructor(x, y, velMax, targetTint, juego) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    this.targetTint = targetTint;

    const loader = new PIXI.Loader();
    loader
      .add('ab00', './img/perro/abajo/00.png')
      .add('ab01', './img/perro/abajo/01.png')
      .add('ab02', './img/perro/abajo/02.png')
      .add('ab03', './img/perro/abajo/03.png')
      .add('ar08', './img/perro/arriba/08.png')
      .add('ar09', './img/perro/arriba/09.png')
      .add('ar10', './img/perro/arriba/10.png')
      .add('ar11', './img/perro/arriba/11.png')
      .add('cl32', './img/perro/corriendoLado/32.png')
      .add('cl33', './img/perro/corriendoLado/33.png')
      .add('cl34', './img/perro/corriendoLado/34.png')
      .add('l04', './img/perro/lado/04.png')
      .add('l05', './img/perro/lado/05.png')
      .add('l06', './img/perro/lado/06.png')
      .add('l07', './img/perro/lado/07.png')
      .add('sa16', './img/perro/sentandoseAbajo/16.png')
      .add('sa17', './img/perro/sentandoseAbajo/17.png')
      .add('sa18', './img/perro/sentandoseAbajo/18.png')
      .add('sa19', './img/perro/sentandoseAbajo/19.png')
      .add('sl20', './img/perro/sentandoseLado/20.png')
      .add('sl21', './img/perro/sentandoseLado/21.png')
      .add('sl22', './img/perro/sentandoseLado/22.png')
      .add('sl23', './img/perro/sentandoseLado/23.png')
      .load(setup);

    function setup(loader, resources) {
      // Crear los arrays de texturas para las animaciones
      const abajoTextures = [
        PIXI.Texture.from(resources.ab00.url),
        PIXI.Texture.from(resources.ab01.url),
        PIXI.Texture.from(resources.ab02.url),
        PIXI.Texture.from(resources.ab03.url),
      ];
      const arribaTextures = [
        PIXI.Texture.from(resources.ar08.url),
        PIXI.Texture.from(resources.ar09.url),
        PIXI.Texture.from(resources.ar10.url),
        PIXI.Texture.from(resources.ab11.url),
      ];
      const corriendoLadoTextures = [
        PIXI.Texture.from(resources.cl32.url),
        PIXI.Texture.from(resources.cl33.url),
        PIXI.Texture.from(resources.cl34.url),
      ];
      const ladoTextures = [
        PIXI.Texture.from(resources.l04.url),
        PIXI.Texture.from(resources.l05.url),
        PIXI.Texture.from(resources.l06.url),
        PIXI.Texture.from(resources.l07.url),
      ];
      const sentandoseAbajoTextures = [
        PIXI.Texture.from(resources.sa16.url),
        PIXI.Texture.from(resources.sa17.url),
        PIXI.Texture.from(resources.sa18.url),
        PIXI.Texture.from(resources.sa19.url),
      ];
      const sentandoseLadoTextures = [
        PIXI.Texture.from(resources.sl20.url),
        PIXI.Texture.from(resources.sl21.url),
        PIXI.Texture.from(resources.sl22.url),
        PIXI.Texture.from(resources.sl23.url),
      ];
      // Crear las animaciones usando AnimatedSprite
      const abajoAnim = new PIXI.AnimatedSprite(abajoTextures);
      const arribaAnim = new PIXI.AnimatedSprite(arribaTextures);
      const corriendoLadoAnim = new PIXI.AnimatedSprite(corriendoLadoTextures);
      const ladoAnim = new PIXI.AnimatedSprite(ladoTextures);
      const sentandoseAbajoAnim = new PIXI.AnimatedSprite(sentandoseAbajoTextures);
      const sentandoseLadoAnim = new PIXI.AnimatedSprite(sentandoseLadoTextures);

      this.cambiarSprite("correrLado"); // Arreglar.
    }
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
