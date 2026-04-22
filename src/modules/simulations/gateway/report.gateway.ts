import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import { SimulationService } from '../services/simulation.service';

const SIMULATION_DURATION_MS = 30 * 60 * 1000;         // 30 minutos
const SIMULATION_WARNING_MS = (30 * 60 - 120) * 1000;

@WebSocketGateway({ namespace: '/simulation', cors: { origin: '*' } })
export class SimulationGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    private timers = new Map<string, NodeJS.Timeout>();
    private warningTimers = new Map<string, NodeJS.Timeout>();
    private sessionMap = new Map<string, string>();

    constructor(private readonly simulationService: SimulationService) { }

    @SubscribeMessage('simulation:start')
    async handleStart(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: StartSimulationDto,
    ) {
        await this.simulationService.start(payload.simulationId);

        this.sessionMap.set(client.id, payload.simulationId);

        const warningTimer = setTimeout(() => {
            client.emit('simulation:warning', {
                message: 'A audiência encerra em 2 minutos.',
                remainingSecs: 120,
            });
        }, SIMULATION_WARNING_MS);

        const timer = setTimeout(async () => {
            await this.finishSimulation(client, payload.simulationId, 'TimedOut');
        }, SIMULATION_DURATION_MS);

        this.timers.set(client.id, timer);
        this.warningTimers.set(client.id, warningTimer);

        client.emit('simulation:started', { simulationId: payload.simulationId });
    }

}