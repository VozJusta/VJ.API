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
      this.socketToCitizen.set(client.id, citizenId);

      const activeSimulationId = this.activeSimulations.get(citizenId);
      if (activeSimulationId) {
        client.emit('simulation:resumed', { simulationId: activeSimulationId });
      }

      const undelivered =
        await this.simulationService.findUndeliveredReports(citizenId);
      for (const report of undelivered) {
        const updated = await this.simulationService.markReportDelivered(
          report.id,
        );

        if (updated) {
          client.emit('simulation:report', {
            simulationId: report.simulation_id,
            reportId: report.id,
          });
        }
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

    this.clearTimers(citizenId);

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
  }

  @OnEvent('simulation.report.ready')
  async handleReportReady(body: ReportReadyDTO) {
    if (!this.server) return;

    const roomName = `citizen:${body.citizenId}`;
    const room = (this.server.adapter as any).rooms?.get(roomName);
    const isConnected = room && room.size > 0;

    if (isConnected) {
      const updated = await this.simulationService.markReportDelivered(
        body.reportId,
      );

      if (updated) {
        this.server.to(roomName).emit('simulation:report', {
          simulationId: body.simulationId,
          reportId: body.reportId,
        });
      }
    }
  }

  private async finishSimulation(
    citizenId: string,
    simulationId: string,
    status: 'Completed' | 'TimedOut',
  ) {
    const activeSimulationId = this.activeSimulations.get(citizenId);
    if (!activeSimulationId || activeSimulationId !== simulationId) return;

    this.clearTimers(citizenId);
    this.activeSimulations.delete(citizenId);

    try {
      await this.simulationService.finish(simulationId, status);
    } catch (error) {
      this.activeSimulations.set(citizenId, simulationId);
      throw error;
    }

    this.server.to(`citizen:${citizenId}`).emit('simulation:end', {
      simulationId,
      status,
    });
  }

  private clearTimers(citizenId: string) {
    clearTimeout(this.timers.get(citizenId));
    clearTimeout(this.warningTimers.get(citizenId));
    this.timers.delete(citizenId);
    this.warningTimers.delete(citizenId);
  }
}
