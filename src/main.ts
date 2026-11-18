/**
 * Startpunkt des Spiels. Das eigentliche Zusammenstecken passiert in app/startGame.ts.
 */
import "./styles.css";
import { startGame } from "./app/startGame";

// Signal an die Startprüfung in index.html: Der Browser hat den Spielcode verstanden.
window.kkBooted = true;

startGame();
