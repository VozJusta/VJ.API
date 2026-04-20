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

    constructor(private readonly simulationService: SimulationService) {}

}