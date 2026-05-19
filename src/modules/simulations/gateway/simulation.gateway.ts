import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SimulationService } from '../services/simulation.service';
import { StartSimulationDto, StopSimulationDto } from '../dto/simulation.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportReadyDTO } from '../dto/report-ready.dto';

const DURATION_MS = 4 * 60 * 1000;
const WARNING_MS = 2 * 60 * 1000;

@WebSocketGateway({ namespace: '/simulation', cors: { origin: '*' } })
export class SimulationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private timers = new Map<string, NodeJS.Timeout>();
  private warningTimers = new Map<string, NodeJS.Timeout>();
  private sessionMap = new Map<string, string>();
  private userMap = new Map<string, string>();

  constructor(private readonly simulationService: SimulationService) {}

  async handleConnection(client: Socket) {
    const citizenId =
      (client.handshake?.auth && (client.handshake.auth as any).citizenId) ||
      (client.handshake?.query && (client.handshake.query as any).citizenId);
    if (typeof citizenId === 'string' && citizenId.trim()) {
      client.join(`citizen:${citizenId}`);
      this.userMap.set(citizenId, client.id);
    }
  }

  @SubscribeMessage('simulation:start')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: StartSimulationDto,
  ) {
    await this.simulationService.start(body);

    this.sessionMap.set(client.id, body.simulationId);
    client.join(`citizen:${body.citizenId}`);

    const warningTimer = setTimeout(() => {
      client.emit('simulation:warning', {
        message: 'A audiência encerra em 2 minutos.',
        remainingSecs: 120,
      });
    }, WARNING_MS);

    const timer = setTimeout(async () => {
      await this.finishSimulation(client, body.simulationId, 'TimedOut');
    }, DURATION_MS);

    this.timers.set(client.id, timer);
    this.warningTimers.set(client.id, warningTimer);
    this.userMap.set(body.citizenId, client.id);

    client.emit('simulation:started', { simulationId: body.simulationId });
  }

  @SubscribeMessage('simulation:stop')
  async handleStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: StopSimulationDto,
  ) {
    await this.finishSimulation(client, body.simulationId, 'Completed');
  }

  async handleDisconnect(client: Socket) {
    const simulationId = this.sessionMap.get(client.id);
    if (simulationId) {
      await this.finishSimulation(client, simulationId, 'Completed');
    }
    this.clearTimers(client.id);
    for (const [citizenId, socketId] of this.userMap.entries()) {
      if (socketId === client.id) this.userMap.delete(citizenId);
    }
  }

  @OnEvent('simulation.report.ready')
  handleReportReady(body: ReportReadyDTO) {
    this.server.to(`citizen:${body.citizenId}`).emit('simulation:report', {
      simulationId: body.simulationId,
      reportId: body.reportId,
    });
  }

  private async finishSimulation(
    client: Socket,
    simulationId: string,
    status: 'Completed' | 'TimedOut',
  ) {
    this.clearTimers(client.id);
    this.sessionMap.delete(client.id);

    await this.simulationService.finish(simulationId, status);

    client.emit('simulation:end', { simulationId, status });
  }

  private clearTimers(clientId: string) {
    clearTimeout(this.timers.get(clientId));
    clearTimeout(this.warningTimers.get(clientId));
    this.timers.delete(clientId);
    this.warningTimers.delete(clientId);
  }
}
