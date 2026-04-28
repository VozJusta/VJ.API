import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketServer,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Prisma } from 'generated/prisma/client';
import { Server, Socket } from 'socket.io';
import jwtConfig from '@m/auth/config/jwt.config';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { TokensPayload } from '@m/common/interfaces/interfaces';
import { NotificationModel } from 'generated/prisma/models/Notification';

type MarkReadPayload = {
	notificationIds?: string[];
};

type SocketUser = Pick<TokensPayload, 'role' | 'sub'>;

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
@Injectable()
export class NotificationsGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(
		private readonly jwtService: JwtService,
		private readonly prisma: PrismaService,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
	) {}

	async handleConnection(client: Socket) {
		try {
			const payload = await this.authenticateClient(client);
			const room = this.getUserRoom(payload);

			client.data.user = payload;
			await client.join(room);
		} catch (error) {
			client.disconnect(true);
		}
	}

	async handleDisconnect(client: Socket) {
		client.data.user = undefined;
	}

	public emitNotification(user: SocketUser, notification: NotificationModel) {
		this.server.to(this.getUserRoom(user)).emit('notifications:new', notification);
	}

	public emitNotificationsUpdated(
		user: SocketUser,
		payload: { updated: number; notificationIds?: string[] },
	) {
		this.server
			.to(this.getUserRoom(user))
			.emit('notifications:updated', payload);
	}

	@SubscribeMessage('notifications:subscribe')
	async handleSubscribe(@ConnectedSocket() client: Socket) {
		const user = this.getAuthenticatedUser(client);

		if (!user) {
			client.disconnect(true);
			return { ok: false, message: 'Socket não autenticado' };
		}

		return {
			ok: true,
			room: this.getUserRoom(user),
			userId: user.sub,
			role: user.role,
		};
	}

	@SubscribeMessage('notifications:mark-read')
	async handleMarkRead(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: MarkReadPayload,
	) {
		const user = this.getAuthenticatedUser(client);

		if (!user) {
			client.disconnect(true);
			return { ok: false, message: 'Socket não autenticado' };
		}

		const notificationIds = body?.notificationIds;

		const ownerFilter =
			user.role === 'Citizen'
				? Prisma.sql`"citizen_id" = ${user.sub}`
				: Prisma.sql`"lawyer_id" = ${user.sub}`;

		const notificationIdsFilter = notificationIds?.length
			? Prisma.sql`AND "id" IN (${Prisma.join(notificationIds)})`
			: Prisma.empty;

		const result = await this.prisma.$executeRaw(
			Prisma.sql`UPDATE "Notification" SET "is_read" = true, "read_at" = ${new Date()} WHERE ${ownerFilter} AND "is_read" = false ${notificationIdsFilter}`,
		);

		this.emitNotificationsUpdated(user, {
			updated: result,
			notificationIds,
		});

		return {
			ok: true,
			updated: result,
		};
	}

	private async authenticateClient(client: Socket) {
		const token = this.extractToken(client);

		if (!token) {
			throw new UnauthorizedException('Token não encontrado');
		}

		try {
			const payload = await this.jwtService.verifyAsync<TokensPayload>(
				token,
				this.jwtConfiguration.accessToken,
			);

			const user =
				payload.role === 'Citizen'
					? await this.prisma.citizen.findUnique({
							where: { id: payload.sub },
							select: { session_id: true },
						})
					: await this.prisma.lawyer.findUnique({
							where: { id: payload.sub },
							select: { session_id: true },
						});

			if (!user || user.session_id !== payload.sessionId) {
				throw new UnauthorizedException(
					'Sessão expirada, faça login novamente',
				);
			}

			return payload;
		} catch (error) {
			throw new UnauthorizedException('Token inválido ou sessão expirada');
		}
	}

	private extractToken(client: Socket) {
		const authToken = client.handshake.auth?.token;

		if (typeof authToken === 'string' && authToken.trim()) {
			return authToken;
		}

		const authorization = client.handshake.headers?.authorization;

		if (!authorization || typeof authorization !== 'string') {
			return;
		}

		return authorization.startsWith('Bearer ')
			? authorization.slice('Bearer '.length)
			: authorization.split(' ')[1];
	}

	private getAuthenticatedUser(client: Socket) {
		return client.data.user as TokensPayload | undefined;
	}

	private getUserRoom(user: SocketUser) {
		return `user:${user.role}:${user.sub}`;
	}

}
