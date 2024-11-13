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

  onCollision(player) {
    // Cuando tocamos un jabon lo agarramos y lo quitamos del piso.
    player.jabonesRecogidos += 1;
    console.log("Se agarro un jabon: ", player.jabonesRecogidos);
    this.container.removeChild(this.sprite);
    this.juego.removeJabon(this);
  }
}
  