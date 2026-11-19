/**
 * Zeigt das Gelände der Inseln im Platzhalter-Look (Greybox, E-023: weich und natürlich).
 *
 * Für jede Insel entsteht ein einziges zusammengefasstes Netz aus Dreiecken („Mesh“), das ihr
 * Land und das umliegende Flachwasser abdeckt: ein Zeichenauftrag pro Insel. Das tiefe Meer
 * dazwischen braucht kein Netz, dort liegt nur der Meeresboden (seaView.ts).
 *
 * Die Höhenpunkte liegen auf den Ecken der Kacheln. Jede Ecke nimmt den Mittelwert der vier
 * Kacheln ringsum; berührt sie eine Ebene, liegt sie genau auf Ebenen-Höhe. So bleiben die
 * Bauflächen ganz flach, während Strände und Berge weich übergehen. Die Farben kommen aus
 * terrain.json und werden an den Ecken ebenfalls gemischt.
 */
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import type { Scene } from "@babylonjs/core/scene";
import type { GameData } from "../data/gameData";
import type { ReadonlyGameState } from "../sim/state";
import { NO_ISLAND } from "../sim/world";
import { elevationToMeters, tileCornerToWorld } from "../sim/worldSpace";
import { colorFromHex, hashToUnit, mixColors } from "./colors";

/** So viele Kacheln Wasser rund um jede Insel gehören noch zu ihrem Netz. */
const WATER_MARGIN = 8;

/** Ab dieser Tiefe (Meter) ist der Boden so dunkel wie das offene Meer und braucht kein Netz. */
const OPEN_SEA_DEPTH = -3.9;

export interface TerrainView {
  /** Höhe des Geländes in Metern an einer Kachel-Ecke (für Bäume, Gebäude, Raster) */
  cornerHeight(x: number, y: number): number;
  /** Anzahl der Inselnetze (= Zeichenaufträge) */
  readonly meshCount: number;
}

export function showTerrain(scene: Scene, state: ReadonlyGameState, data: GameData): TerrainView {
  const { world } = state;
  const { width, height } = world;
  const codes = data.terrainCode;
  const plainMeters = data.worldGen.plainHeight;
  const tileColors = data.terrains.map((terrain) => colorFromHex(terrain.color));
  const beachColor = tileColors[codes.beach] ?? Color3.White();
  const shallowColor = tileColors[codes.shallow_water] ?? Color3.White();
  const deepColor = tileColors[codes.deep_water] ?? Color3.Black();

  // ── Höhe und Farbe jeder Kachel-Ecke ──
  const cornerWidth = width + 1;
  const cornerHeights = new Float32Array(cornerWidth * (height + 1));
  const cornerColors = new Float32Array(cornerWidth * (height + 1) * 3);
  for (let cy = 0; cy <= height; cy++) {
    for (let cx = 0; cx <= width; cx++) {
      let sum = 0;
      let count = 0;
      let touchesPlain = false;
      const color = new Color3(0, 0, 0);
      for (let dy = -1; dy <= 0; dy++) {
        for (let dx = -1; dx <= 0; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= width || y >= height) {
            continue;
          }
          const index = y * width + x;
          const terrain = world.terrain[index] ?? codes.deep_water;
          const meters = elevationToMeters(world.elevation[index] ?? 0);
          sum += meters;
          count += 1;
          touchesPlain ||= terrain === codes.plain;
          color.addInPlace(tileColorFor(terrain, meters));
        }
      }
      const cornerIndex = cy * cornerWidth + cx;
      const meters = touchesPlain ? plainMeters : count > 0 ? sum / count : -4;
      cornerHeights[cornerIndex] = meters;
      // Leichte Helligkeits-Unterschiede, damit große Flächen nicht wie Plastik wirken
      const shade = (0.96 + hashToUnit(cornerIndex) * 0.08) / Math.max(1, count);
      cornerColors[cornerIndex * 3] = color.r * shade;
      cornerColors[cornerIndex * 3 + 1] = color.g * shade;
      cornerColors[cornerIndex * 3 + 2] = color.b * shade;
    }
  }

  /** Farbe einer Kachel; Wasser zeigt den Meeresboden: hell und sandig an der Küste, dunkler draußen. */
  function tileColorFor(terrain: number, meters: number): Color3 {
    if (terrain === codes.shallow_water || terrain === codes.deep_water) {
      const sandy = mixColors(beachColor, shallowColor, (-meters - 0.2) / 1.6);
      return mixColors(sandy, deepColor, (-meters - 1.8) / 2.2);
    }
    const base = tileColors[terrain] ?? Color3.Gray();
    if (terrain === codes.mountain) {
      // Höhere Berg-Teile etwas heller (wie verwitterter Fels)
      return base.scale(0.92 + Math.min(0.2, (meters - plainMeters) * 0.015));
    }
    return base;
  }

  // ── Welche Kachel gehört zu welchem Inselnetz? Wasser zur nächstgelegenen Insel. ──
  const owner = nearestIsland(state);
  const material = new StandardMaterial("terrainMaterial", scene);
  material.diffuseColor = Color3.White(); // die Farben kommen aus den Ecken
  material.specularColor = Color3.Black();
  material.freeze();

  let meshCount = 0;
  for (const island of state.islands) {
    const mesh = buildIslandMesh(island.id);
    if (mesh !== undefined) {
      mesh.material = material;
      mesh.isPickable = false;
      mesh.freezeWorldMatrix();
      meshCount += 1;
    }
  }

  function buildIslandMesh(islandId: number): Mesh | undefined {
    const tiles: number[] = [];
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let index = 0; index < owner.length; index++) {
      if (owner[index] !== islandId) {
        continue;
      }
      const x = index % width;
      const y = (index - x) / width;
      // Kacheln, deren vier Ecken alle im offenen Meer liegen, deckt der Meeresboden ab.
      const corners = [
        cornerHeights[y * cornerWidth + x] ?? 0,
        cornerHeights[y * cornerWidth + x + 1] ?? 0,
        cornerHeights[(y + 1) * cornerWidth + x] ?? 0,
        cornerHeights[(y + 1) * cornerWidth + x + 1] ?? 0,
      ];
      if (corners.every((meters) => meters <= OPEN_SEA_DEPTH)) {
        continue;
      }
      tiles.push(index);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if (tiles.length === 0) {
      return undefined;
    }

    // Eckpunkte des Rechtecks um die Insel; Dreiecke nur für die Kacheln der Insel
    const boxWidth = maxX - minX + 2; // Ecken pro Zeile
    const boxHeight = maxY - minY + 2;
    const positions = new Float32Array(boxWidth * boxHeight * 3);
    const colors = new Float32Array(boxWidth * boxHeight * 4);
    for (let row = 0; row < boxHeight; row++) {
      for (let column = 0; column < boxWidth; column++) {
        const cx = minX + column;
        const cy = minY + row;
        const corner = cy * cornerWidth + cx;
        const vertex = row * boxWidth + column;
        const point = tileCornerToWorld(cx, cy);
        positions[vertex * 3] = point.x;
        positions[vertex * 3 + 1] = cornerHeights[corner] ?? 0;
        positions[vertex * 3 + 2] = point.z;
        colors[vertex * 4] = cornerColors[corner * 3] ?? 0;
        colors[vertex * 4 + 1] = cornerColors[corner * 3 + 1] ?? 0;
        colors[vertex * 4 + 2] = cornerColors[corner * 3 + 2] ?? 0;
        colors[vertex * 4 + 3] = 1;
      }
    }
    const indices = new Uint32Array(tiles.length * 6);
    tiles.forEach((index, i) => {
      const x = (index % width) - minX;
      const y = Math.floor(index / width) - minY;
      const southWest = y * boxWidth + x;
      const southEast = southWest + 1;
      const northWest = southWest + boxWidth;
      const northEast = northWest + 1;
      // Zwei Dreiecke pro Kachel, in derselben Umlaufrichtung wie Babylons eigener Boden
      // (sonst wären sie von oben unsichtbar)
      indices.set([southWest, southEast, northWest, southEast, northEast, northWest], i * 6);
    });

    const normals = new Float32Array(positions.length);
    VertexData.ComputeNormals(positions, indices, normals);
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;
    const mesh = new Mesh(`island-${String(islandId)}`, scene);
    vertexData.applyToMesh(mesh, false);
    return mesh;
  }

  return {
    meshCount,
    cornerHeight: (x, y) => {
      if (x < 0 || y < 0 || x > width || y > height) {
        return -4;
      }
      return cornerHeights[y * cornerWidth + x] ?? 0;
    },
  };
}

/**
 * Zu welcher Insel gehört jede Kachel für die Darstellung? Land: zur eigenen Insel.
 * Wasser bis WATER_MARGIN Kacheln vor der Küste: zur nächstgelegenen Insel. Sonst 0.
 * (Ausbreitung Schritt für Schritt von den Küsten aus, wie Wellen.)
 */
function nearestIsland(state: ReadonlyGameState): Uint8Array {
  const { world } = state;
  const { width, height } = world;
  const owner = new Uint8Array(width * height);
  let frontier: number[] = [];
  for (let index = 0; index < owner.length; index++) {
    const id = world.island[index] ?? NO_ISLAND;
    if (id !== NO_ISLAND) {
      owner[index] = id;
      frontier.push(index);
    }
  }
  for (let step = 1; step <= WATER_MARGIN && frontier.length > 0; step++) {
    const next: number[] = [];
    for (const index of frontier) {
      const x = index % width;
      const y = (index - x) / width;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          continue;
        }
        const neighbour = ny * width + nx;
        if (owner[neighbour] === 0) {
          owner[neighbour] = owner[index] ?? 0;
          next.push(neighbour);
        }
      }
    }
    frontier = next;
  }
  return owner;
}
