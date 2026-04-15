// import { LawyerAnalyticsResponseDTO } from "@modules/dashboard/dto/lawyer-analytics.dto";
// import { PrismaService } from "@modules/prisma/service/prisma.service";
// import { NotFoundException, BadRequestException, Injectable } from "@nestjs/common";

// @Injectable()
// export class AcceptedRequestAnalyticsService {
//   constructor(private readonly prisma: PrismaService) {}

//   async acceptedRequestAnalytics(
//     userId: string,
//     role: string,
//   ): Promise<LawyerAnalyticsResponseDTO> {
//     const userRole = role.toLowerCase();

//     if (userRole === 'lawyer') {
//       const lawyer = await this.prisma.lawyer.findFirst({
//         where: { id: userId },
//         select: { id: true },
//       });

//       if (!lawyer) {
//         throw new NotFoundException('Advogado não encontrado');
//       }
//       const acceptedReports = await this.prisma.report.findMany({
//         where: {
//           status: 'Accepted',
//           lawyer_id: userId,
//         },
//         select: { created_at: true },
//         orderBy: { created_at: 'asc' },
//       });

//       const groupedByDate = acceptedReports.reduce<Record<string, number>>(
//         (acc, report) => {
//           const date = report.created_at.toISOString().split('T')[0];
//           acc[date] = (acc[date] ?? 0) + 1;
//           return acc;
//         },
//         {},
//       );

//       return {
//         data: Object.entries(groupedByDate).map(([date, value]) => ({
//           date,
//           value,
//         })),
//       };
//     }

//     throw new BadRequestException('Role inválida');
//   }
// }
