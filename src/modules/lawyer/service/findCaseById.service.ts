import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

type JsonLike = Record<string, unknown>;

function formatCaseDossierDates(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => formatCaseDossierDates(item));
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as JsonLike);
    const formatted: JsonLike = {};

    for (const [key, entryValue] of entries) {
      if (key === 'updated_at') {
        continue;
      }

      if (key === 'created_at' && entryValue) {
        const parsedDate =
          entryValue instanceof Date
            ? entryValue
            : new Date(entryValue as string);

        formatted[key] = Number.isNaN(parsedDate.getTime())
          ? entryValue
          : parsedDate.toISOString().split('T')[0];
        continue;
      }

      formatted[key] = formatCaseDossierDates(entryValue);
    }

    return formatted;
  }

  return value;
}

@Injectable()
export class FindCaseById {
  constructor(private readonly prisma: PrismaService) {}

  async findCase(userId: string, role: string, caseId: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const allInfoCase = await this.prisma.case.findFirst({
        where: {
          id: caseId,
          OR: [
            { lawyer_id: userId },
            { caseRequests: { some: { lawyer_id: userId } } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
            },
          },
          lawyer: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              bio: true,
              specialization: true,
              oab_number: true,
              oab_state: true,
            },
          },
          conversations: {
            orderBy: { created_at: 'asc' },
            select: {
              id: true,
              is_closed: true,
              created_at: true,
              messages: {
                orderBy: { created_at: 'asc' },
                select: {
                  id: true,
                  role: true,
                  content: true,
                  created_at: true,
                },
              },
            },
          },
          reports: {
            orderBy: { created_at: 'desc' },
            select: {
              id: true,
              transcription: true,
              normalized_text: true,
              legal_analysis: true,
              simplified_explanation: true,
              category_detected: true,
              confidence_score: true,
              created_at: true,
              user: {
                select: {
                  id: true,
                  full_name: true,
                },
              },
              lawyer: {
                select: {
                  id: true,
                  full_name: true,
                  phone: true,
                },
              },
              evidence: {
                select: {
                  id: true,
                  file_url: true,
                  ocr_content: true,
                  embedding: true,
                },
              },
              ai_versions: {
                orderBy: { created_at: 'desc' },
                select: {
                  id: true,
                  model: true,
                  provider: true,
                  prompt: true,
                  response: true,
                  tokens_used: true,
                  latency_ms: true,
                  created_at: true,
                },
              },
              ragContexts: {
                orderBy: { created_at: 'desc' },
                select: {
                  id: true,
                  source: true,
                  content: true,
                  score: true,
                  created_at: true,
                },
              },
            },
          },
        },
      });

      if (!allInfoCase) {
        throw new NotFoundException('Caso não encontrado');
      }

      return formatCaseDossierDates(allInfoCase);
    }

    throw new BadRequestException('Role inválida');
  }
}
