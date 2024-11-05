let mostrarTuto = true;

// Crear la aplicación PixiJS
let app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);

// Crear el elemento de video
let videoElement = document.createElement('video');
videoElement.src = './video/Menu.mp4';
videoElement.loop = true;
videoElement.muted = true;

// Esperar a que el video esté listo para reproducirse
videoElement.addEventListener('canplaythrough', () => {
    videoElement.play();

    // Crear la textura del video
    let videoTexture = PIXI.Texture.from(videoElement);

    // Crear el sprite del video
    let videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = app.screen.width;
    videoSprite.height = app.screen.height;

    // Añadir el sprite del video al escenario
    app.stage.addChild(videoSprite);

    // Create "Press Start" Text
    let startText = new PIXI.Text('Press Enter to Start', {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0x000000,
        align: 'center'
    });
    startText.anchor.set(0.5);
    startText.x = app.screen.width / 2;
    startText.y = app.screen.height - 50;
    startText.visible = false; // Hacer el texto invisible
    app.stage.addChild(startText);

    // Codigo que Maneja cuando se presiona Enter en el Menu
    const keydownHandler = (event) => {
        if (event.key === 'Enter') {
            if (mostrarTuto) {
                videoSprite.visible = false;
                mostrarTuto = false;
                // Escondemos texto menu
                startText.visible = false;

                // Cargar la imagen de fondo
                PIXI.Loader.shared
                    .add('tuto', 'fondo1.png')
                    .load((loader, resources) => {
                        // Crear sprite para la imagen cargada
                        const tuto = new PIXI.Sprite(resources.tuto.texture);

                        tuto.width = app.screen.width;
                        tuto.height = app.screen.height;

                        // Añadir el sprite de la imagen al escenario
                        app.stage.addChild(tuto);

                        // Función para redimensionar el canvas y los sprites
                        function resize() {
                            if(app.renderer) { // Revisamos x un bug random
                                app.renderer.resize(window.innerWidth, window.innerHeight);
                                tuto.width = app.screen.width;
                                tuto.height = app.screen.height;
                            }
                            
                        }

                        // Para arreglar lo del tamaño si cambia.
                        window.addEventListener("resize", resize);
                    });
                return;
            }
            // Destruimos esta app y arrancamos el juego.
            app.destroy(true);
            // Remuevo el listener para que no joda dsps
            window.removeEventListener('keydown', keydownHandler);
            window.removeEventListener("resize", resize);
            app = StartGame();
        }
    };

    // Evento para hacer desaparecer el video y mostrar la imagen al presionar Enter
    window.addEventListener('keydown', keydownHandler);

    // Función para redimensionar el canvas y los sprites
    function resize() {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        videoSprite.width = app.screen.width;
        videoSprite.height = app.screen.height;
        startText.x = app.screen.width / 2;
        startText.y = app.screen.height - 50;
    }

    // Para arreglar lo del tamaño si cambia.
    window.addEventListener("resize", resize);
});