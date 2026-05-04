import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import PDFDocument from "pdfkit";

@Injectable()
export class GeneratePdfService {
    constructor(private prisma: PrismaService) { }

    async generateSimulationReportPdf(id: string, res: Response) {
        const simulationReport = await this.prisma.simulationReport.findUnique({
            where: { id },
            include: {
                simulation: true,
                user: true,
            },
        });

        if (!simulationReport) {
            throw new NotFoundException("Relatório de simulação não encontrado");
        }

        const metrics =
            simulationReport.metrics_json
                ? (simulationReport.metrics_json as Record<string, unknown>)
                : {};

        const data = {
            score: simulationReport.score ?? 0,
            strengths: simulationReport.strengths ?? [],
            weaknesses: simulationReport.weaknesses ?? [],
            personality: simulationReport.personality,
            duration_secs: simulationReport.duration_secs ?? 0,
            metrics,
            full_transcript: simulationReport.full_transcript,
            created_at: simulationReport.created_at,
            userId: simulationReport.user_id || "",
        };

        const doc = new PDFDocument();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=simulation-report-${Date.now()}.pdf`
        );

        doc.pipe(res);

        // ── Título ──────────────────────────────────────────────────────────
        doc.fontSize(18).text("Relatório de Simulação", { align: "center" });
        doc.moveDown(0.5);

        doc
            .fontSize(11)
            .fillColor("gray")
            .text(
                `Gerado em: ${data.created_at.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}`,
                { align: "center" }
            );
        doc.fillColor("black");

        doc.moveDown();

        // ── Informações gerais ───────────────────────────────────────────────
        doc.fontSize(12).text("Participante:", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(data.userId);

        doc.moveDown();

        doc.fontSize(12).text("Personalidade:", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(formatPersonality(data.personality));

        doc.moveDown();

        // ── Pontuação e duração ──────────────────────────────────────────────
        doc.fontSize(12).text("Pontuação:", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(`${data.score} / 100`);

        doc.moveDown();

        doc.fontSize(12).text("Duração da Simulação:", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(formatDuration(data.duration_secs));

        doc.moveDown();

        // ── Pontos fortes ────────────────────────────────────────────────────
        doc.fontSize(12).text("Pontos Fortes:", { underline: true });
        doc.moveDown(0.5);

        if (data.strengths.length > 0) {
            data.strengths.forEach((strength) => {
                doc.fontSize(11).text(`• ${strength}`);
            });
        } else {
            doc.fontSize(11).text("Nenhum ponto forte registrado.");
        }

        doc.moveDown();

        // ── Pontos de melhoria ───────────────────────────────────────────────
        doc.fontSize(12).text("Pontos de Melhoria:", { underline: true });
        doc.moveDown(0.5);

        if (data.weaknesses.length > 0) {
            data.weaknesses.forEach((weakness) => {
                doc.fontSize(11).text(`• ${weakness}`);
            });
        } else {
            doc.fontSize(11).text("Nenhum ponto de melhoria registrado.");
        }

        doc.moveDown();

        // ── Métricas ─────────────────────────────────────────────────────────
        const metricEntries = Object.entries(data.metrics);
        if (metricEntries.length > 0) {
            doc.fontSize(12).text("Métricas:", { underline: true });
            doc.moveDown(0.5);

            metricEntries.forEach(([key, value]) => {
                doc
                    .fontSize(11)
                    .text(`${formatMetricKey(key)}: ${value}`);
            });

            doc.moveDown();
        }

        doc.end();
    }
}

function formatPersonality(personality: string): string {
    const map: Record<string, string> = {
        AGGRESSIVE: "Agressivo",
        PASSIVE: "Passivo",
        ASSERTIVE: "Assertivo",
        COLLABORATIVE: "Colaborativo",
        ANALYTICAL: "Analítico",
    };
    return map[personality] ?? personality;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}min ${s}s`;
}

function formatMetricKey(key: string): string {
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
}