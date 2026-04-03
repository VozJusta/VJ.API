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

        doc.fontSize(12).text(`Área: ${formatArea(data.area)}`);

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

function formatArea(area: string): string {
    const translations: Record<string, string> = {
        Administrative: 'Direito Administrativo',
        Customs: 'Direito Aduaneiro',
        Legal_support: 'Suporte Jurídico',
        Aviation: 'Direito Aeronáutico',
        Agrarian: 'Direito Agrário',
        Environmental: 'Direito Ambiental',
        Arbitration: 'Arbitragem',
        Copyright: 'Direitos Autorais',
        Banking_and_financial: 'Direito Bancário e Financeiro',
        Biotechnology: 'Biotecnologia',
        Civil: 'Direito Civil',
        Commercial: 'Direito Comercial',
        International_trade: 'Comércio Internacional',
        Competition: 'Direito da Concorrência',
        Constitutional: 'Direito Constitucional',
        Consumer: 'Direito do Consumidor',
        Commercial_contracts: 'Contratos Comerciais',
        Sports: 'Direito Esportivo',
        Water: 'Direito de Águas',
        Third_sector: 'Terceiro Setor',
        Economic: 'Direito Econômico',
        Electoral: 'Direito Eleitoral',
        Corporate_criminal: 'Direito Penal Empresarial',
        Energy: 'Direito de Energia',
        Bankruptcy: 'Falência e Recuperação Judicial',
        Family: 'Direito de Família',
        Mergers: 'Fusões e Aquisições',
        Real_estate: 'Direito Imobiliário',
        Import_and_export: 'Importação e Exportação',
        Infrastructure: 'Infraestrutura',
        International: 'Direito Internacional',
        Internet_and_ECommerce: 'Internet e Comércio Eletrônico',
        Maritime: 'Direito Marítimo',
        Capital_markets: 'Mercado de Capitais',
        Mining: 'Direito Minerário',
        Financial_operations: 'Operações Financeiras',
        Criminal: 'Direito Penal',
        Oil_and_gas: 'Óleo e Gás',
        Social_security: 'Direito Previdenciário',
        Project_finance: 'Financiamento de Projetos',
        Intellectual_property: 'Propriedade Intelectual',
        Corporate_restructuring: 'Reestruturação Empresarial',
        Regulatory: 'Direito Regulatório',
        Health_and_sanitary: 'Direito Sanitário',
        Insurance: 'Seguros',
        Labor_union: 'Direito Sindical',
        Corporate: 'Direito Empresarial',
        Telecommunications: 'Telecomunicações',
        Labor_and_employment: 'Direito do Trabalho',
        Tax: 'Direito Tributário',
    };

    if (translations[area]) {
        return translations[area];
    }

    return area
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
}