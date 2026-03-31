import { Injectable } from "@nestjs/common";
import { PdfReportDTO } from "../dto/pdf-report.dto";
import PDFDocument from "pdfkit";
import { Response } from "express";

@Injectable()
export class PdfService {
    generateReportPdf(data: PdfReportDTO, res: Response) {
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=report-${Date.now()}.pdf`
        );

        doc.pipe(res);

        doc
            .fontSize(18)
            .text('Relatório Jurídico', { align: 'center' });

        doc.moveDown();

        doc.fontSize(12).text('Relato:', { underline: true });
        doc.moveDown(0.5);
        doc.text(data.input);

        doc.moveDown();

        doc.fontSize(12).text(`Área: ${data.area}`);

        doc.moveDown();

        doc.text('Análise:', { underline: true });
        doc.moveDown(0.5);
        doc.text(data.analysis);

        doc.moveDown();

        doc.text('Explicação simplificada:', { underline: true });
        doc.moveDown(0.5);
        doc.text(data.explanation);

        doc.moveDown();

        doc.text('Próximos passos:', { underline: true });
        doc.moveDown(0.5);

        if (Array.isArray(data.next_steps)) {
            data.next_steps.forEach((step: string, index: number) => {
                doc.text(`${index + 1}. ${step}`);
            });
        }

        doc.moveDown();

        doc.text(`Confiança: ${data.confidence}`);

        doc.end();
    }
}