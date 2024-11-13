class Jabon extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 0, juego);

    this.juego = juego;
    this.speedUpValue = 150000;

    let url = "./img/jabon.png";

    let texture = PIXI.Texture.from(url);
    texture.baseTexture.on("loaded", () => {
      this.sprite = new PIXI.Sprite(texture);
      //this.sprite.scale.set(1.5 + Math.random() * 0.5);
      //this.sprite.anchor.set(0.5, 1);

      this.container.addChild(this.sprite);

      //this.actualizarZIndex();
      //this.container.zIndex = -1;
      this.container.scale.x = Math.random() > 0.5 ? 1 : -1;
      this.actualizarPosicionEnGrid();
    });
  }

  checkCollision(player) {
    if (!this.sprite || !player.spritesAnimados[player.spriteActual]) {
      return false;
    }

    const boundsA = this.sprite.getBounds();
    const boundsB = player.spritesAnimados[player.spriteActual].getBounds();

    return boundsA.x < boundsB.x + boundsB.width &&
           boundsA.x + boundsA.width > boundsB.x &&
           boundsA.y < boundsB.y + boundsB.height &&
           boundsA.y + boundsA.height > boundsB.y;
  }

  onCollision(player) {
    player.jabonesRecogidos += 1;
    this.container.removeChild(this.sprite);
    this.juego.removeJabon(this);
  }
}
  