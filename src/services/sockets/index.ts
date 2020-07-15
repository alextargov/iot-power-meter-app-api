import { Server } from 'http';
import SocketIO from 'socket.io';

import { SocketEvent } from '../../constants/socket';
import { loggerService } from '../logger';

let io: SocketIO.Server;

const userConnections = new Map<string, SocketIO.Socket>();
const logNamespace = 'SocketsService';

const initializeSocket = (server: Server, port) => {
    io = SocketIO(server);

    io.on('connect', (socket: SocketIO.Socket) => {
        loggerService.debug(`[${logNamespace}]: initializeSocket(): Connected client on port ${port}`);

        socket.on(SocketEvent.AUTH, (userId: string) => {
            loggerService.debug(`[${logNamespace}]: initializeSocket(): Event ${SocketEvent.AUTH} received for user ${userId}`);

            userConnections.set(userId.toString(), socket);
        });

        socket.on('disconnect', () => {
            loggerService.debug(`[${logNamespace}]: initializeSocket(): Client with socket id ${socket.id} disconnected`);
        });
    });
};

const emitMessage = (event, data) => io.emit(event, data);

export const socketsService = {
    emitMessage,
    initializeSocket,
    userConnections,
};
