import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { LlmService } from '@m/ai/services/llm.service';
import { RagService } from '@m/ai/services/rag.service';
import { SimulationChatDto } from '../dto/simulation.dto';

@Injectable()
export class SimulationChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly rag: RagService,
  ) { }

  async chat(dto: SimulationChatDto): Promise<string> {
    const simulation = await this.prisma.simulation.findUniqueOrThrow({
      where: { id: dto.simulationId },
    });

    if (simulation.status !== 'InProgress') {
      throw new BadRequestException('Simulação não está em andamento ou já foi encerrada');
    }

    const ragContexts = await this.rag.retrieve(dto.text);

    const history = await this.prisma.simulationTurn.findMany({
      where: { simulation_id: dto.simulationId },
      orderBy: { created_at: 'asc' },
      take: 20,
    });

    const aiText = await this.llm.completeSimulation({
      personality: simulation.personality,
      ragContexts,
      history: history.map(t => ({ role: t.role, content: t.content })),
      userMessage: dto.text,
    });

    await this.prisma.simulationTurn.createMany({
      data: [
        { simulation_id: dto.simulationId, role: 'User', content: dto.text },
        { simulation_id: dto.simulationId, role: 'Ai', content: aiText },
      ],
    });

    return aiText;
  }
}