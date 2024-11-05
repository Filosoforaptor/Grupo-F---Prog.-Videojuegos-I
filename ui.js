class UI {
    constructor(juego) {
        this.juego = juego;
        this.container = new PIXI.Container();
        this.container.visible = true;
        this.container.zIndex = 9000000; // Es Ui , tiene el index mas grande.

        this.juego.uiContainer.addChild(this.container);

        this.clockStart = new Date().getTime();
        this.timer = 60;
        this.stop = false;

        // Variables para minimapa
        this.paddingMM = 10;
        this.anchoMM = 400;
        this.altoMM = 300;
        this.burbujas = [];

        // Crear los textos 

        this.score1 = new PIXI.Text('Texto 1', { fontFamily: 'fuente', fontSize: 50, fill: 0xFF0000, padding: 20 }); // NPC 2
        this.score2 = new PIXI.Text('Texto 2', { fontFamily: 'fuente', fontSize: 50, fill: 0x00FF00, padding: 20 }); //Player
        this.score3 = new PIXI.Text('Texto 3', { fontFamily: 'fuente', fontSize: 50, fill: 0x0000FF, padding: 20 }); // NPC 1
        this.reloj = new PIXI.Text(this.timer, { fontFamily: 'fuente', fontSize: 50, fill: 0x0F000F, padding: 20 }); // Reloj 

        // Posicionar los textos
        this.score1.position.set(50, 50);
        this.score2.position.set(50, 125);
        this.score3.position.set(50, 200);
        this.reloj.position.set(window.innerWidth / 1.105, 50); // 200

        // Agregar los textos al container
        this.container.addChild(this.score1);
        this.container.addChild(this.score2);
        this.container.addChild(this.score3);
        this.container.addChild(this.reloj);

        // Agregamos el minimapa
        this.ponerMinimapa();

        // Manejamos el resize de la UI
        const resizeUI = () => {
            // LINEA IMPORTANTE O NO ANDAN LOS RESIZE
            this.juego.app.renderer.resize(window.innerWidth, window.innerHeight);
            // Cambiamos de lugar el reloj y el minimapa.
            this.reloj.position.set(window.innerWidth - 125, 50);
            let xPos = this.juego.app.screen.width - this.anchoMM - this.paddingMM;
            let yPos = this.juego.app.screen.height - this.altoMM - this.paddingMM;
            this.minimap.position.set(xPos, yPos);
            //console.log("MINIMAPA X Y REAL: ", this.minimap.position);
            console.log(this.minimap.position);
        }

        // Para arreglar lo del tama;o si cambia.
        window.addEventListener("resize", resizeUI);
    }

    updateScores() {
        if (this.juego.contadorDeFrames % 4 == 1) {
            this.score1.text = this.juego.npc2.contadorColisiones;
            this.score2.text = this.juego.player.contadorColisiones;
            this.score3.text = this.juego.npc1.contadorColisiones;
        }
    }

    updateReloj() {
        if (this.stop) { return; } // Si se termino salimos

        // Terminar juego
        if (this.timer == 0) {
            this.ejecutarAlgo();
            this.stop = true
            return;
        }
        let ahora = new Date().getTime();

        // Si no paso 1 segundo
        if (ahora - this.clockStart < 1000) {
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
        this.updateMinimap();
    }

    getHighestScore() {
        let s1 = this.juego.npc2.contadorColisiones;
        let s2 = this.juego.player.contadorColisiones;
        let s3 = this.juego.npc1.contadorColisiones;
        console.log(s1, s2, s3);
        // Podria poner caso para empates pero no tengo ganas.
        if (s1 > s2 && s1 > s3) {
            return "Gano NPC 2!"; // NPC 2
        } else if (s2 > s1 && s2 > s3) {
            return "Gano el Player!"; // Player
        } else {
            return "Gano NPC 1!"; // NPC 1
        }
    }

    ejecutarAlgo() {
        console.log("Game Over");
        // Nos fijamos el ganador y lo pasamos.
        let winner = this.getHighestScore();
        this.juego.StartEndScreen(winner);
    }

    ponerMinimapa() {
        // Crear un gráfico
        this.minimap = new PIXI.Graphics();

        // Dibujar un rectángulo semi transparente
        const fillColor = 0x66CCFF; // Color de relleno
        const borderColor = 0xFF3300; // Color del borde
        const borderAlpha = 1; // Opacidad del borde
        const fillAlpha = 0.5; // Opacidad del relleno (0 es completamente transparente, 1 es completamente opaco)

        this.minimap.beginFill(fillColor, fillAlpha);
        this.minimap.lineStyle(4, borderColor, borderAlpha);

        let xPos = this.juego.app.screen.width - this.anchoMM - this.paddingMM;
        let yPos = this.juego.app.screen.height - this.altoMM - this.paddingMM;
        this.minimap.drawRect(0, 0, this.anchoMM, this.altoMM); // Pos x, y  y luego ancho y alto
        this.minimap.endFill();

        // Añadir el rectángulo al escenario
        this.container.addChild(this.minimap);
        this.minimap.position.set(xPos, yPos);
        console.log("Minimapa creado en posición: ", this.minimap.position);

        // Agregamos un cuadradito del player y los npc
        this.ponerPlayerEnMinimapa();
        this.ponerNPCsEnMinimapa();
        this.ponerBurbujasEnMinimapa();
    }

    ponerPlayerEnMinimapa() {
        // Creo el rectángulo del personaje en el minimapa
        this.playerMM = new PIXI.Graphics();
        this.playerMM.beginFill(0x00FF00); // Color verde para el rectángulo del personaje
        this.playerMM.drawRect(0, 0, 10, 10); // Tamaño del rectángulo (ajústalo según tus necesidades)
        this.playerMM.endFill();
        this.minimap.addChild(this.playerMM);
    }

    ponerNPCsEnMinimapa() {
        // NPC 1
        this.npc1 = new PIXI.Graphics();
        this.npc1.beginFill(0x0000FF);
        this.npc1.drawRect(0, 0, 10, 10);
        this.npc1.endFill();
        this.minimap.addChild(this.npc1);

        // NPC 2
        this.npc2 = new PIXI.Graphics();
        this.npc2.beginFill(0xFF0000);
        this.npc2.drawRect(0, 0, 10, 10);
        this.npc2.endFill();
        this.minimap.addChild(this.npc2);
    }

    sacarBurbujasDeMinimapa() {
        this.burbujas.forEach(burbuja => {
            this.minimap.removeChild(burbuja);
        });
        this.burbujas = [];
    }

    ponerBurbujasEnMinimapa() {
        // Limpio las viejas
        this.sacarBurbujasDeMinimapa();
        // Creo el rectángulo del personaje en el minimapa
        this.juego.ovejas.forEach(burbuja => {
            if (burbuja.tint == this.juego.player.targetTint) {
                let burbujita = new PIXI.Graphics();
                burbujita.beginFill(0xFFFFFF); // Color BURBUJAS en minimapa
                let burbujaX = (burbuja.container.x / this.juego.canvasWidth) * this.anchoMM;
                let burbujaY = (burbuja.container.y / this.juego.canvasHeight) * this.altoMM;
                burbujita.drawCircle(burbujaX, burbujaY, 5); // Tamaño del circulo (ajústalo según tus necesidades)
                burbujita.endFill();
                this.burbujas.push(burbujita);
                this.minimap.addChild(burbujita);
            }
        }
        )

    }

    updateMinimap() {
        // Calcula la posición del personaje en el minimapa PARA PLAYER
        let minimapX = (this.juego.player.container.x / this.juego.canvasWidth) * this.anchoMM;
        let minimapY = (this.juego.player.container.y / this.juego.canvasHeight) * this.altoMM;
        //console.log(this.juego.player.container.x, minimapX, minimapY);
        // Establece la posición del rectángulo del personaje en el minimapa
        this.playerMM.position.set(minimapX, minimapY);

        // NPC1
        let mmNpc1PosX = (this.juego.npc1.container.x / this.juego.canvasWidth) * this.anchoMM;
        let mmNpc1PosY = (this.juego.npc1.container.y / this.juego.canvasHeight) * this.altoMM;
        this.npc1.position.set(mmNpc1PosX, mmNpc1PosY);

        // NPC2
        let mmNpc2PosX = (this.juego.npc2.container.x / this.juego.canvasWidth) * this.anchoMM;
        let mmNpc2PosY = (this.juego.npc2.container.y / this.juego.canvasHeight) * this.altoMM;
        this.npc2.position.set(mmNpc2PosX, mmNpc2PosY);

        // Burbujas

        this.ponerBurbujasEnMinimapa();
    }


}