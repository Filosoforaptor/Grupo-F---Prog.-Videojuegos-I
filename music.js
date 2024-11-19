// List of files to load
let audioMenu = PIXI.sound.Sound.from({
    url: './music/inMenu.mp3',
    preload: true,
    loaded: function(err, sound) {
        sound.play({
            volume: 0.09,
            loop: true
            });
        console.log("Menu Precargado.");
    }
});
let audioInGame = PIXI.sound.Sound.from({
    url: './music/inGame.mp3',
    preload: true,
    loaded: function(err, sound) {
        console.log("InGame Precargado.");
    }
});
let audioGameOver = PIXI.sound.Sound.from({
    url: './music/gameOver.mp3',
    preload: true,
    loaded: function(err, sound) {
        console.log("GameOver Precargado.");
    }
});
let agarrarJabon = PIXI.sound.Sound.from({
    url: './music/agarrarJabon.mp3',
    preload: true,
    loaded: function(err, sound) {
        console.log("SFX 1 Precargado.");
    }
});
let usarJabon = PIXI.sound.Sound.from({
    url: './music/usarJabon.mp3',
    preload: true,
    loaded: function(err, sound) {
        console.log("SFX 2 Precargado.");
    }
});

const canciones = { MENU : audioMenu, IN_GAME : audioInGame, GAME_OVER : audioGameOver};
const sfx = { agarrarJabon : agarrarJabon, usarJabon : usarJabon};

let player = canciones.MENU;
player.paused = false;

// Función para reproducir la música
function playMusic(song, volume = 1) {
    if (player.paused) {
        player = song;
        player.loop = true;
        player.volume = volume;
        player.play();
        console.log('Música reproducida');
    } else {
        console.log("Deteniendo Cancion Anterior");
        pauseMusic();
        playMusic(song, volume);
    }
}

// Función para pausar la música
function pauseMusic() {
    if (!player.paused) {
        player.pause();
        console.log('Música pausada');
    }
}

// Función para reproducir el efecto de sonido (SFX)
function playSFX(sonido, vol = 1) {
    sonido.volume = vol;
    sonido.play();
    console.log('Efecto de sonido reproducido');
}

