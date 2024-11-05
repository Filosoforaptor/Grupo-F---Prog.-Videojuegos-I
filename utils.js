// utils.js

function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

function normalizarVector(x, y) {
  if (x == 0 && y == 0) {
    return null;
  }

  let magnitud = calculoDeDistanciaRapido(0, 0, x, y);

  if (magnitud == 0) return null;

  let rta = { x, y };

  rta.x /= magnitud;
  rta.y /= magnitud;

  return rta;
}

function calculoDeDistanciaRapido(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  if (dx > dy) {
    return dx + 0.4 * dy;
  } else {
    return dy + 0.4 * dx;
  }
}

// Función para calcular la distancia entre dos puntos
function calculoDeDistancia(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// utils.js

/**
 * Calcula la distancia al cuadrado entre dos puntos.
 * @param {number} x1 - La coordenada x del primer punto.
 * @param {number} y1 - La coordenada y del primer punto.
 * @param {number} x2 - La coordenada x del segundo punto.
 * @param {number} y2 - La coordenada y del segundo punto.
 * @returns {number} La distancia al cuadrado entre los dos puntos.
 */
function distanciaAlCuadrado(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

function generarID(longitud = 8) {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < longitud; i++) {
    id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return id;
}

function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}

function radians_to_degrees(radians)
{
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply radians by 180 divided by pi to convert to degrees.
  return radians * (180/pi);
}

// Función para verificar colisión entre 2 sprites
function colisiona(sprite1, sprite2) {
  //console.log(typeof(sprite1), typeof(sprite2));
  let bounds1 = sprite1.getBounds();
  let bounds2 = sprite2.getBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
}

function eliminarContainerYHijos(container, juego) {
  // Verificar si container es un PIXI.Container y tiene hijos
  if (container instanceof PIXI.Container && container.children) {
      while (container.children.length > 0) {
          container.removeChild(container.children[0]);
      }
      // Luego eliminar el container del stage
      juego.app.stage.removeChild(container);
  } else {
      console.error('El objeto no es un PIXI.Container o no tiene hijos:', container);
  }
  //debugger;
}

class Linea {
  constructor(juego, color, origen) {
    this.juego = juego;
    this.myGraph = new PIXI.Graphics();
    this.juego.app.stage.addChild(this.myGraph);
    this.color = color;
    this.origen = origen;
  }

  drawLineToTarget(targetX, targetY) {
    try {
      this.juego.app.stage.removeChild(this.myGraph);
      this.myGraph.clear();
      //console.log("Se borro.");
    } catch (e) {
      //console.log("No existe la linea");
    }
    //console.log(targetX, " ", targetY);

    // Draw the line
    this.myGraph.lineStyle(2, this.color, 1);
    this.myGraph.moveTo(this.origen.x, this.origen.y);
    this.myGraph.lineTo(targetX, targetY);
    // Add the graphics
    this.juego.app.stage.addChild(this.myGraph);
  }
}

          