class UI {
    constructor(juego) {
        this.juego = juego;
        this.container = new PIXI.Container();
        this.container.visible = true;
        this.container.zIndex = 9000000; // Es Ui , tiene el index mas grande.

        this.juego.app.stage.addChild(this.container);

        this.clockStart = new Date().getTime();
        this.timer = 60;
        this.stop = false;

        // Crear los textos
        this.score1 = new PIXI.Text('Texto 1', { fontFamily: 'fuente', fontSize: 50, fill: 0xFF0000 }); // NPC 2
        this.score2 = new PIXI.Text('Texto 2', { fontFamily: 'fuente', fontSize: 50, fill: 0x00FF00 }); //Player
        this.score3 = new PIXI.Text('Texto 3', { fontFamily: 'fuente', fontSize: 50, fill: 0x0000FF }); // NPC 1
        this.reloj = new PIXI.Text(this.timer, { fontFamily: 'fuente', fontSize: 50, fill: 0x0F000F }); // Reloj

        // Posicionar los textos
        this.score1.position.set(50, 50);
        this.score2.position.set(50, 100);
        this.score3.position.set(50, 150);
        this.reloj.position.set(200, 50);

        // Agregar los textos al container
        this.container.addChild(this.score1);
        this.container.addChild(this.score2);
        this.container.addChild(this.score3);
        this.container.addChild(this.reloj);
    }

    updateScores() {
        if (this.juego.contadorDeFrames % 4 == 1) {
            this.score1.text = this.juego.npc2.contadorColisiones;
            this.score2.text = this.juego.player.contadorColisiones;
            this.score3.text = this.juego.npc1.contadorColisiones;
        }
    }

    updateReloj() {
        if(this.stop) {return;} // Si se termino salimos

        // Terminar juego
        if(this.timer == 0)
        {
            this.ejecutarAlgo();
            this.stop = true
            return;
        }
        let ahora = new Date().getTime();

        // Si no paso 1 segundo
        if(ahora - this.clockStart < 1000) {
            return;
        // Si paso un segundo
        } else {
            this.timer -= 1;
            this.clockStart = ahora;
            this.reloj.text = this.timer;
        }
    }

    update() {
        this.updateScores();
        this.updateReloj();
    }

    ejecutarAlgo()
    {
        console.log("Game Over");
    }
}