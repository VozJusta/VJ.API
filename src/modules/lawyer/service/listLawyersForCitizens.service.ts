import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationLawyersDTO } from '../dto/pagination-lawyers.dto';

@Injectable()
export class ListLawyersForCitizens {
  constructor(private readonly prisma: PrismaService) {}

  async listLawyers(
    userId: string,
    role: string,
    pagination: PaginationLawyersDTO,
  ) {
    const userRole = role.toLowerCase();
    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 2, 10);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Página inválida');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('PageSize inválido');
    }

    const skip = (page - 1) * pageSize;

    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      const [lawyers, totalItems] = await this.prisma.$transaction([
        this.prisma.lawyer.findMany({
          where: { lawyer_status: 'Verified' },
          select: {
            id: true,
            full_name: true,
            specialization: true,
            avatar_image: true,
            rating: true,
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: pageSize,
        }),
        this.prisma.lawyer.count({
          where: { lawyer_status: 'Verified' },
        }),
      ]);

      const lawyersWithRating = lawyers.map((lawyer) => ({
        ...lawyer,
        rating:
          lawyer.rating === null || lawyer.rating === undefined
            ? lawyer.rating
            : lawyer.rating.toNumber(),
      }));

      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        data: lawyersWithRating,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    throw new BadRequestException('Role inválida');
  }
}
