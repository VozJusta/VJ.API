import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.service";

@Injectable()
export class CreateEvidenceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }
    async createEvidence(file: Express.Multer.File, userId: string, role: string, reportId: string) {
        const userRole = role.toLowerCase();
        if (userRole !== 'citizen') {
            throw new UnauthorizedException('Apenas cidadãos podem criar evidências');
        }

        const citizenId = await this.prisma.citizen.findUnique({
            where: { id: userId },
        });
        if (!citizenId) {
            throw new NotFoundException('Cidadão não encontrado');
        }

        const report = await this.prisma.report.findFirst({
            where: {
                id: reportId,
                citizen_id: userId,
            },
        });

        if (!report) {
            throw new NotFoundException('Report não encontrado');
        }

        const upload = await this.cloudinaryService.uploadFile(file);

        const evidence = await this.prisma.evidence.create({
            data: {
                file_url: upload.secure_url,
                ocr_content: upload.ocr_content,
                public_id: upload.public_id,
                report_id: reportId,

            }
        })

        return{
            evidence: evidence,
            upload: upload
        }

    }
}