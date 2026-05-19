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
import { JwtService } from '@nestjs/jwt';
import { SimulationService } from '../services/simulation.service';
import { StartSimulationDto, StopSimulationDto } from '../dto/simulation.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportReadyDTO } from '../dto/report-ready.dto';
import { AuthSessionService } from '@modules/auth/service/authSession.service';

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
  private activeSimulations = new Map<string, string>();
  private socketToCitizen = new Map<string, string>();
  private userMap = new Map<string, string>();

  constructor(
    private readonly simulationService: SimulationService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.authSessionService.validateAccessToken(token);
      const citizenId = payload.sub;

      if (!citizenId || payload.role !== 'Citizen') {
        client.disconnect();
        return;
      }

      client.join(`citizen:${citizenId}`);
      this.userMap.set(citizenId, client.id);
      this.socketToCitizen.set(client.id, citizenId);

      const activeSimulationId = this.activeSimulations.get(citizenId);
      if (activeSimulationId) {
        client.emit('simulation:resumed', { simulationId: activeSimulationId });
      }

      const undelivered =
        await this.simulationService.findUndeliveredReports(citizenId);
      for (const report of undelivered) {
        client.emit('simulation:report', {
          simulationId: report.simulation_id,
          reportId: report.id,
        });
        await this.simulationService.markReportDelivered(report.id);
      }
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('simulation:start')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: StartSimulationDto,
  ) {
    const citizenId = this.socketToCitizen.get(client.id);
    if (!citizenId) {
      client.disconnect();
      return;
    }

    const startRequest: StartSimulationDto & { citizenId: string } = {
      ...body,
      citizenId,
    };

    await this.simulationService.start(startRequest);

    this.activeSimulations.set(citizenId, body.simulationId);
    client.join(`citizen:${citizenId}`);

    const warningTimer = setTimeout(() => {
      this.server.to(`citizen:${citizenId}`).emit('simulation:warning', {
        message: 'A audiência encerra em 2 minutos.',
        remainingSecs: 120,
      });
    }, WARNING_MS);

    const timer = setTimeout(async () => {
      await this.finishSimulation(citizenId, body.simulationId, 'TimedOut');
    }, DURATION_MS);

    this.timers.set(citizenId, timer);
    this.warningTimers.set(citizenId, warningTimer);
    this.userMap.set(citizenId, client.id);

    client.emit('simulation:started', { simulationId: body.simulationId });
  }

  @SubscribeMessage('simulation:stop')
  async handleStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: StopSimulationDto,
  ) {
    const citizenId = this.socketToCitizen.get(client.id);

    if (!citizenId) {
      client.disconnect();
      return;
    }

    await this.finishSimulation(citizenId, body.simulationId, 'Completed');
  }

  async handleDisconnect(client: Socket) {
    this.socketToCitizen.delete(client.id);

    for (const [citizenId, socketId] of this.userMap.entries()) {
      if (socketId === client.id) this.userMap.delete(citizenId);
    }
  }

  @OnEvent('simulation.report.ready')
handleReportReady(body: ReportReadyDTO) {
  if (!this.server) return;

  const isConnected = this.userMap.has(body.citizenId);
  if (!isConnected) return; // será entregue via banco na reconexão

  this.server.to(`citizen:${body.citizenId}`).emit('simulation:report', {
    simulationId: body.simulationId,
    reportId: body.reportId,
  });
}

  private async finishSimulation(
    citizenId: string,
    simulationId: string,
    status: 'Completed' | 'TimedOut',
  ) {
    const activeSimulationId = this.activeSimulations.get(citizenId);
    if (!activeSimulationId || activeSimulationId !== simulationId) return;

    this.clearTimers(citizenId);

    try {
      await this.simulationService.finish(simulationId, status);
      this.activeSimulations.delete(citizenId);

      this.server.to(`citizen:${citizenId}`).emit('simulation:end', {
        simulationId,
        status,
      });
    } catch (error) {
      throw error;
    }
  }

  private clearTimers(citizenId: string) {
    clearTimeout(this.timers.get(citizenId));
    clearTimeout(this.warningTimers.get(citizenId));
    this.timers.delete(citizenId);
    this.warningTimers.delete(citizenId);
  }
}
