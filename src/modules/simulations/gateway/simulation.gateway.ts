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
  private sessionMap = new Map<string, string>();
  private socketToCitizen = new Map<string, string>();
  private userMap = new Map<string, string>();
  private pendingReports = new Map<string, ReportReadyDTO[]>();

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

      if (!citizenId) {
        client.disconnect();
        return;
      }

      if (payload.role !== 'Citizen') {
        client.disconnect();
        return;
      }

      client.join(`citizen:${citizenId}`);
      this.userMap.set(citizenId, client.id);
      this.socketToCitizen.set(client.id, citizenId);

      const pending = this.pendingReports.get(citizenId);
      if (pending?.length) {
        for (const report of pending) {
          client.emit('simulation:report', {
            simulationId: report.simulationId,
            reportId: report.reportId,
          });
        }
        this.pendingReports.delete(citizenId);
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

    await this.simulationService.start(body);

    this.sessionMap.set(client.id, body.simulationId);
    client.join(`citizen:${citizenId}`);

    const warningTimer = setTimeout(() => {
      this.server.to(`citizen:${citizenId}`).emit('simulation:warning', {
        message: 'A audiência encerra em 2 minutos.',
        remainingSecs: 120,
      });
    }, WARNING_MS);

    const timer = setTimeout(async () => {
      await this.finishSimulation(client.id, body.simulationId, 'TimedOut');
    }, DURATION_MS);

    this.timers.set(client.id, timer);
    this.warningTimers.set(client.id, warningTimer);
    this.userMap.set(citizenId, client.id);

    client.emit('simulation:started', { simulationId: body.simulationId });
  }

  @SubscribeMessage('simulation:stop')
  async handleStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: StopSimulationDto,
  ) {
    await this.finishSimulation(client.id, body.simulationId, 'Completed');
  }

  async handleDisconnect(client: Socket) {
    this.socketToCitizen.delete(client.id);

    for (const [citizenId, socketId] of this.userMap.entries()) {
      if (socketId === client.id) this.userMap.delete(citizenId);
    }
  }

  @OnEvent('simulation.report.ready')
  handleReportReady(body: ReportReadyDTO) {
    if (!this.server) {
      const list = this.pendingReports.get(body.citizenId) ?? [];
      list.push(body);
      this.pendingReports.set(body.citizenId, list);
      return;
    }

    const roomName = `citizen:${body.citizenId}`;
    const isConnected = this.userMap.has(body.citizenId);

    if (isConnected) {
      this.server.to(roomName).emit('simulation:report', {
        simulationId: body.simulationId,
        reportId: body.reportId,
      });
    } else {
      const list = this.pendingReports.get(body.citizenId) ?? [];
      list.push(body);
      this.pendingReports.set(body.citizenId, list);
    }
  }

  private async finishSimulation(
    clientId: string,
    simulationId: string,
    status: 'Completed' | 'TimedOut',
  ) {
    const activeSimulationId = this.sessionMap.get(clientId);
    if (!activeSimulationId || activeSimulationId !== simulationId) return;

    this.clearTimers(clientId);
    this.sessionMap.delete(clientId);

    await this.simulationService.finish(simulationId, status);

    const citizenId = this.socketToCitizen.get(clientId);
    if (citizenId) {
      this.server.to(`citizen:${citizenId}`).emit('simulation:end', {
        simulationId,
        status,
      });
      this.socketToCitizen.delete(clientId);
    }
  }

  private clearTimers(clientId: string) {
    clearTimeout(this.timers.get(clientId));
    clearTimeout(this.warningTimers.get(clientId));
    this.timers.delete(clientId);
    this.warningTimers.delete(clientId);
  }
}
