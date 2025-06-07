import kaboom, { type PosComp } from "kaboom";
import type { Socket } from "socket.io-client";

export interface IGameProps {
    gameId: string;
    opponent: string;
    socket: Socket;
}
export interface IPlyaerProps {
    pos: PosComp;

}