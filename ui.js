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
        this.anchoMM = 290; // 400
        this.altoMM = 180; // 300
        this.burbujas = [];
        this.cantJabones = 0;

        // Crear los textos 

        this.score1 = new PIXI.Text('Texto 1', { fontFamily: 'fuente', fontSize: 75, fill: 0xFF0000, padding: 20 }); // NPC 2
        this.score2 = new PIXI.Text('Texto 2', { fontFamily: 'fuente', fontSize: 75, fill: 0x00FF00, padding: 20 }); //Player
        this.score3 = new PIXI.Text('Texto 3', { fontFamily: 'fuente', fontSize: 75, fill: 0x0000FF, padding: 20 }); // NPC 1
        this.reloj = new PIXI.Text(this.timer, { fontFamily: 'fuente', fontSize: 67, fill: 0x0F000F, padding: 20 }); // Reloj
        this.jabonesT = new PIXI.Text(this.cantJabones, { fontFamily: 'fuente', fontSize: 67, fill: 0x0F000F, padding: 20 }); // Texto de Jabones 
        // 

        // Ponemos las imagenes de la UI, GRACIAS NACHITOOO :3 !
        this.texto1 = PIXI.Sprite.from('./img/resaltador.png');
        this.texto2 = PIXI.Sprite.from('./img/resaltador.png');
        this.texto3 = PIXI.Sprite.from('./img/resaltador.png');
        this.fondoTimer = PIXI.Sprite.from('./img/fondotimer.png');
        this.jabonIMG = PIXI.Sprite.from('./img/jabon.png');

        const lengthSprite = 95;

        this.texto1.position.set(10, 45);
        this.texto2.position.set(10, 45 + (lengthSprite));
        this.texto3.position.set(10, 45 + (lengthSprite * 2));
        // Para pos del display de jabones.

        let offsetJaboncitoX = 175;
        let offsetJaboncitoY = -140;
        let xJaboncito = (this.juego.app.screen.width - this.anchoMM - this.paddingMM - 50) - offsetJaboncitoX;
        let yJaboncito = (this.juego.app.screen.height - this.altoMM - this.paddingMM - 30) - offsetJaboncitoY;
        this.jabonIMG.position.set(xJaboncito , yJaboncito );
        this.jabonIMG.scale.set(1.5);
        //
        

        this.container.addChild(this.texto1);
        this.container.addChild(this.texto2);
        this.container.addChild(this.texto3);
        this.container.addChild(this.jabonIMG);
        

        this.texto1.scale.set(0.9); // Para cambiar la escala de la imagen.
        this.texto2.scale.set(0.9);
        this.texto3.scale.set(0.9);
        this.fondoTimer.scale.set(0.6);

        // Posicionar los textos
        this.score1.position.set(70, 40);
        this.score2.position.set(70, 135);
        this.score3.position.set(70, 230);
        this.reloj.position.set(window.innerWidth / 2 - this.reloj.width / 2, 50); // Centrar el reloj
        let offsetJabonTx = 85;
        let offsetJabonTy = -5;

        this.jabonesT.position.set(this.jabonIMG.position.x + offsetJabonTx, this.jabonIMG.position.y + offsetJabonTy);

        // Posicionar la imagen del fondo del reloj centrada con respecto al reloj
        this.fondoTimer.position.set((window.innerWidth / 2 - this.reloj.width / 2) -33 , 26);

        // Agregar los textos al container
        this.container.addChild(this.score1);
        this.container.addChild(this.score2);
        this.container.addChild(this.score3);
        this.container.addChild(this.fondoTimer);
        this.container.addChild(this.reloj);
        this.container.addChild(this.jabonesT);

        // Agregamos el minimapa
        this.ponerMinimapa();

        // Agregamos el Hiding de Score en mouse Over
        this.implementarMouseOverScores();

        // Manejamos el resize de la UI
        const resizeUI = () => {
            // LINEA IMPORTANTE O NO ANDAN LOS RESIZE
            this.juego.app.renderer.resize(window.innerWidth, window.innerHeight);
            // Resizear el Reloj
            this.fondoTimer.position.set((window.innerWidth / 2 - this.reloj.width / 2) -33 , 26);
            this.reloj.position.set(window.innerWidth / 2 - this.reloj.width / 2, 50); // Centrar el reloj
            // Cambiamos de lugar el minimapa.
            let xPos = this.juego.app.screen.width - this.anchoMM - this.paddingMM -50;
            let yPos = this.juego.app.screen.height - this.altoMM - this.paddingMM -30;
            this.minimap.position.set(xPos, yPos);
            this.imagenMinimap.position.set(xPos -40, yPos - 35);
            //console.log("MINIMAPA X Y REAL: ", this.minimap.position);
            //console.log(this.minimap.position);
            this.jabonIMG.position.set(xPos - offsetJaboncitoX, yPos - offsetJaboncitoY);
            this.jabonesT.position.set(this.jabonIMG.position.x + offsetJabonTx, this.jabonIMG.position.y + offsetJabonTy);
        }

        // Para arreglar lo del tama;o si cambia.
        window.addEventListener("resize", resizeUI);
    }



    updateScores() {
        if (this.juego.contadorDeFrames % 4 == 1) {
            this.score1.text = formatNumber(this.juego.npc2.contadorColisiones);
            this.score2.text = formatNumber(this.juego.player.contadorColisiones);
            this.score3.text = formatNumber(this.juego.npc1.contadorColisiones);
        }
    }

    updateReloj() {
        if (this.stop) { return; } // Si se termino salimos

        // Terminar juego
        if (this.timer == 0) {
            this.triggerGameOver();
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
            this.reloj.text = (this.timer < 10) ? "0" + this.timer : this.timer;
        }
    }

    cambiarDisplayJabon(cant)
    {
        this.cantJabones += cant;
        // Hacer que cambie el display.
        this.jabonesT.text = this.cantJabones; 
    }

    update() {
        this.updateScores();
        this.updateReloj();
        this.updateMinimap();
    }

    // Te dice quien gano.
    getHighestScore() {
        let s1 = this.juego.npc2.contadorColisiones;
        let s2 = this.juego.player.contadorColisiones;
        let s3 = this.juego.npc1.contadorColisiones;
        console.log(s1, s2, s3);
        // Podria poner caso para empates pero no tengo ganas.
        if (s1 > s2 && s1 > s3) {
            return "2"; // NPC 2
        } else if (s2 > s1 && s2 > s3) {
            return "P"; // Player
        } else {
            return "1"; // NPC 1
        }
    }

    triggerGameOver() {
        console.log("Game Over");
        // Nos fijamos el ganador y lo pasamos.
        let winner = this.getHighestScore();
        this.juego.StartEndScreen(winner);
        // Quitamos los jabones restantes. xq quitar el evento no funciono..
        this.juego.player.jabonesRecogidos = 0;
        // Ponemos la musica de game Over.
        playMusic(canciones.GAME_OVER, 0.8);
    }

    ponerMinimapa() {
        // Crear un gráfico
        this.minimap = new PIXI.Graphics();
        this.imagenMinimap = PIXI.Sprite.from('./img/baniera.png');

        // Añadir la imagen al contenedor
        this.container.addChild(this.imagenMinimap);

        // Dibujar un rectángulo semi transparente
        const fillColor = 0x66CCFF; // Color de relleno
        const borderColor = 0xFF3300; // Color del borde
        const borderAlpha = 0; // Opacidad del borde
        const fillAlpha = 0.1; // Opacidad del relleno (0 es completamente transparente, 1 es completamente opaco)

        this.minimap.beginFill(fillColor, fillAlpha);
        this.minimap.lineStyle(4, borderColor, borderAlpha);

        let xPos = this.juego.app.screen.width - this.anchoMM - this.paddingMM - 50;
        let yPos = this.juego.app.screen.height - this.altoMM - this.paddingMM - 30;

        // Ajustar la posición de la imagen para que encaje debajo del minimapa
        this.imagenMinimap.anchor.set(0);
        this.imagenMinimap.position.set(xPos - 40, yPos - 35);
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

        // Hacemos que el minimapa tenga transparencia cuando se le coloca el mouse arriba.
        this.implementarMouseOverMinimapa();
        
    }

    implementarMouseOverScores(){
        // Hacer que el minimapa se haga invisible cuando uno pasa el mouse por encima / una nacheada
        this.texto1.interactive = true;
        this.texto2.interactive = true;
        this.texto3.interactive = true;
        this.score1.interactive = true;
        this.score2.interactive = true;
        this.score3.interactive = true;

        this.texto1.on('mouseover', () => {
            this.texto1.alpha = 0.5;
            this.texto2.alpha = 0.5;
            this.texto3.alpha = 0.5;
            this.score1.alpha = 0.5;
            this.score2.alpha = 0.5;
            this.score3.alpha = 0.5;
        });
        this.texto1.on('mouseout', () => {
            this.texto1.alpha = 1;
            this.texto2.alpha = 1;
            this.texto3.alpha = 1;
            this.score1.alpha = 1;
            this.score2.alpha = 1;
            this.score3.alpha = 1;
        });
        //
        this.texto2.on('mouseover', () => {
            this.texto1.alpha = 0.5;
            this.texto2.alpha = 0.5;
            this.texto3.alpha = 0.5;
            this.score1.alpha = 0.5;
            this.score2.alpha = 0.5;
            this.score3.alpha = 0.5;
        });
        this.texto2.on('mouseout', () => {
            this.texto1.alpha = 1;
            this.texto2.alpha = 1;
            this.texto3.alpha = 1;
            this.score1.alpha = 1;
            this.score2.alpha = 1;
            this.score3.alpha = 1;
        });
        //
        this.texto3.on('mouseover', () => {
            this.texto1.alpha = 0.5;
            this.texto2.alpha = 0.5;
            this.texto3.alpha = 0.5;
            this.score1.alpha = 0.5;
            this.score2.alpha = 0.5;
            this.score3.alpha = 0.5;
        });
        this.texto3.on('mouseout', () => {
            this.texto1.alpha = 1;
            this.texto2.alpha = 1;
            this.texto3.alpha = 1;
            this.score1.alpha = 1;
            this.score2.alpha = 1;
            this.score3.alpha = 1;
        });
        //
        this.score1.on('mouseover', () => {
            this.texto1.alpha = 0.5;
            this.texto2.alpha = 0.5;
            this.texto3.alpha = 0.5;
            this.score1.alpha = 0.5;
            this.score2.alpha = 0.5;
            this.score3.alpha = 0.5;
        });
        this.score1.on('mouseout', () => {
            this.texto1.alpha = 1;
            this.texto2.alpha = 1;
            this.texto3.alpha = 1;
            this.score1.alpha = 1;
            this.score2.alpha = 1;
            this.score3.alpha = 1;
        });
        //
        this.score2.on('mouseover', () => {
            this.texto1.alpha = 0.5;
            this.texto2.alpha = 0.5;
            this.texto3.alpha = 0.5;
            this.score1.alpha = 0.5;
            this.score2.alpha = 0.5;
            this.score3.alpha = 0.5;
        });
        this.score2.on('mouseout', () => {
            this.texto1.alpha = 1;
            this.texto2.alpha = 1;
            this.texto3.alpha = 1;
            this.score1.alpha = 1;
            this.score2.alpha = 1;
            this.score3.alpha = 1;
        });
        //
        this.score3.on('mouseover', () => {
            this.texto1.alpha = 0.5;
            this.texto2.alpha = 0.5;
            this.texto3.alpha = 0.5;
            this.score1.alpha = 0.5;
            this.score2.alpha = 0.5;
            this.score3.alpha = 0.5;
        });
        this.score3.on('mouseout', () => {
            this.texto1.alpha = 1;
            this.texto2.alpha = 1;
            this.texto3.alpha = 1;
            this.score1.alpha = 1;
            this.score2.alpha = 1;
            this.score3.alpha = 1;
        });
    }

    implementarMouseOverMinimapa(){
        // Hacer que el minimapa se haga invisible cuando uno pasa el mouse por encima / una nacheada
        this.imagenMinimap.interactive = true;
        this.imagenMinimap.on('mouseover', () => {
            this.minimap.alpha = 0.5;
            this.imagenMinimap.alpha = 0.5;
        });
        this.imagenMinimap.on('mouseout', () => {
            this.minimap.alpha = 1;
            this.imagenMinimap.alpha = 1;
        });
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
        this.juego.burbujas.forEach(burbuja => {
            if (burbuja.tint == this.juego.player.targetTint) {
                let burbujita = new PIXI.Graphics();
                burbujita.beginFill(0xFFFFFF); // Color BURBUJITAS en minimapa
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