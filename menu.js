let mostrarTuto = true;
// Crear la aplicación PixiJS
let app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);

// Cargar la imagen de fondo
PIXI.Loader.shared
    .add('fondo', 'fondo.png')
    .add('tuto', 'fondo1.png')
    .load((loader, resources) => {
    // Crear sprites para cada imagen cargada
    const fondo = new PIXI.Sprite(resources.fondo.texture);
    const tuto = new PIXI.Sprite(resources.tuto.texture);

    fondo.width = app.screen.width;
    fondo.height = app.screen.height;
    tuto.width = app.screen.width;
    tuto.height = app.screen.height;

    // Añadir los sprites al escenario
    app.stage.addChild(tuto);
    app.stage.addChild(fondo);
     // Create "Press Start" Text
     let startText = new PIXI.Text('Press Start', {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0x000000,
        align: 'center'
    });
    startText.anchor.set(0.5);
    startText.x = app.screen.width / 2;
    startText.y = app.screen.height - 50;
    app.stage.addChild(startText);

    // Evento para hacer desaparecer la imagen al presionar Enter
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (mostrarTuto){
                fondo.visible = false;
                mostrarTuto = false;
                // Escondemos texto menu
                startText.visible = false;
                return;
            }
            // Destruimos esta app y arrancamos el juego.
            app.destroy(true);
            app = StartGame();
        }
    });
});