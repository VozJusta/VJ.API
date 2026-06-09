import { Injectable, NotFoundException } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { Response } from "express";
import { PrismaService } from "@m/prisma/service/prisma.service";
import * as path from "path";
import * as fs from "fs";

// Coloque o logo em: src/assets/logo.png
const LOGO_PATH = path.resolve(__dirname, "./images/logo-name.png");

const COLORS = {
  primary: "#1A3557",    
  accent: "#C8A96E",     
  text: "#2D2D2D",       
  muted: "#6B7280",      
  light: "#F3F6FA",      
  white: "#FFFFFF",
  border: "#D1D5DB",
};

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateReportPdf(id: string, res: Response) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { ai_versions: true },
    });

    if (!report) {
      throw new NotFoundException("Relatório não encontrado");
    }

    const aiData = report.ai_versions?.[0]
      ? JSON.parse(report.ai_versions[0].response)
      : {};

    const data = {
      input: report.transcription,
      area: report.category_detected,
      analysis: report.legal_analysis,
      explanation: report.simplified_explanation,
      next_steps: aiData.next_steps || [],
      confidence: aiData.confidence || 0,
    };

    const doc = new PDFDocument({ margin: 0, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${Date.now()}.pdf`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentLeft = 50;
    const contentRight = pageWidth - 50;
    const contentWidth = contentRight - contentLeft;

    // ─── CABEÇALHO ───────────────────────────────────────────────
    doc.rect(0, 0, pageWidth, 110).fill(COLORS.primary);

    // Linha dourada no topo
    doc.rect(0, 0, pageWidth, 5).fill(COLORS.accent);

    // Logo (se existir)
    const logoExists = fs.existsSync(LOGO_PATH);
    if (logoExists) {
      doc.image(LOGO_PATH, contentLeft, 20, { height: 55, fit: [140, 55] });
    }

    // Título no cabeçalho
    const titleX = logoExists ? contentLeft + 155 : contentLeft;
    doc
      .fillColor(COLORS.white)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Relatório Jurídico", titleX, 30, { width: contentWidth - (logoExists ? 155 : 0) });

    doc
      .fillColor(COLORS.accent)
      .fontSize(10)
      .font("Helvetica")
      .text(`Emitido em: ${formatDate(new Date())}`, titleX, 58, {
        width: contentWidth - (logoExists ? 155 : 0),
      });

    // ─── BADGE DE ÁREA ───────────────────────────────────────────
    let currentY = 130;

    const areaLabel = formatArea(data.area);
    const badgeW = Math.min(doc.widthOfString(areaLabel) + 28, contentWidth);
    doc.roundedRect(contentLeft, currentY, badgeW, 24, 5).fill(COLORS.accent);
    doc
      .fillColor(COLORS.white)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(areaLabel, contentLeft + 14, currentY + 7, { width: badgeW - 28 });

    currentY += 42;

    // ─── SEÇÃO: RELATO ───────────────────────────────────────────
    currentY = drawSection(doc, "Relato", data.input, currentY, contentLeft, contentWidth, COLORS);

    // ─── SEÇÃO: ANÁLISE JURÍDICA ─────────────────────────────────
    currentY = drawSection(doc, "Análise Jurídica", data.analysis, currentY, contentLeft, contentWidth, COLORS);

    // ─── SEÇÃO: EXPLICAÇÃO SIMPLIFICADA ──────────────────────────
    currentY = drawSection(doc, "Explicação Simplificada", data.explanation, currentY, contentLeft, contentWidth, COLORS);

    // ─── SEÇÃO: PRÓXIMOS PASSOS ───────────────────────────────────
    if (Array.isArray(data.next_steps) && data.next_steps.length > 0) {
      currentY = drawNextSteps(doc, data.next_steps, currentY, contentLeft, contentWidth, COLORS);
    }

    // ─── BARRA DE CONFIANÇA ───────────────────────────────────────
    currentY = drawConfidenceBar(doc, data.confidence, currentY, contentLeft, contentWidth, COLORS);

    // ─── RODAPÉ ───────────────────────────────────────────────────
    const footerY = pageHeight - 40;
    doc.rect(0, footerY - 10, pageWidth, 50).fill(COLORS.primary);
    doc
      .fillColor(COLORS.muted)
      .fontSize(8)
      .font("Helvetica")
      .text(
        "Este relatório foi gerado automaticamente e não substitui a orientação de um advogado habilitado.",
        contentLeft,
        footerY,
        { width: contentWidth, align: "center" }
      );

    doc.end();
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function drawSection(
  doc: PDFKit.PDFDocument,
  title: string,
  content: string,
  y: number,
  left: number,
  width: number,
  colors: typeof COLORS
): number {
  if (!content) return y;

  // Título da seção
  doc
    .fillColor(colors.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), left, y);

  y += 16;

  // Linha separadora dourada
  doc.rect(left, y, 40, 2).fill(colors.accent);
  y += 10;

  // Caixa de conteúdo
  const textHeight = doc.heightOfString(content, { width: width - 24 });
  const boxHeight = textHeight + 20;

  doc.roundedRect(left, y, width, boxHeight, 4).fill(colors.light);
  doc
    .fillColor(colors.text)
    .fontSize(10)
    .font("Helvetica")
    .text(content, left + 12, y + 10, { width: width - 24, lineGap: 3 });

  return y + boxHeight + 20;
}

function drawNextSteps(
  doc: PDFKit.PDFDocument,
  steps: string[],
  y: number,
  left: number,
  width: number,
  colors: typeof COLORS
): number {
  doc
    .fillColor(colors.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("PRÓXIMOS PASSOS", left, y);

  y += 16;
  doc.rect(left, y, 40, 2).fill(colors.accent);
  y += 10;

  steps.forEach((step, i) => {
    const textHeight = doc.heightOfString(step, { width: width - 50 });
    const rowHeight = textHeight + 16;

    // Numeração
    doc.circle(left + 12, y + rowHeight / 2, 11).fill(colors.primary);
    doc
      .fillColor(colors.white)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(`${i + 1}`, left + 7, y + rowHeight / 2 - 6, { width: 12, align: "center" });

    // Texto
    doc
      .fillColor(colors.text)
      .fontSize(10)
      .font("Helvetica")
      .text(step, left + 32, y + 8, { width: width - 40, lineGap: 3 });

    y += rowHeight + 6;
  });

  return y + 14;
}

function drawConfidenceBar(
  doc: PDFKit.PDFDocument,
  confidence: number,
  y: number,
  left: number,
  width: number,
  colors: typeof COLORS
): number {
  const pct = Math.min(Math.max(confidence, 0), 100);

  doc
    .fillColor(colors.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("NÍVEL DE CONFIANÇA", left, y);

  y += 20;

  // Trilha
  doc.roundedRect(left, y, width, 12, 6).fill(colors.border);

  // Preenchimento
  const fillColor = pct >= 70 ? "#22C55E" : pct >= 40 ? "#F59E0B" : "#EF4444";
  if (pct > 0) {
    doc.roundedRect(left, y, (width * pct) / 100, 12, 6).fill(fillColor);
  }

  // Percentual
  doc
    .fillColor(colors.muted)
    .fontSize(10)
    .font("Helvetica")
    .text(`${pct}%`, left + width + 8, y);

  return y + 30;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatArea(area: string): string {
  const translations: Record<string, string> = {
    Administrative: "Direito Administrativo",
    Customs: "Direito Aduaneiro",
    Legal_support: "Suporte Jurídico",
    Aviation: "Direito Aeronáutico",
    Agrarian: "Direito Agrário",
    Environmental: "Direito Ambiental",
    Arbitration: "Arbitragem",
    Copyright: "Direitos Autorais",
    Banking_and_financial: "Direito Bancário e Financeiro",
    Biotechnology: "Biotecnologia",
    Civil: "Direito Civil",
    Commercial: "Direito Comercial",
    International_trade: "Comércio Internacional",
    Competition: "Direito da Concorrência",
    Constitutional: "Direito Constitucional",
    Consumer: "Direito do Consumidor",
    Commercial_contracts: "Contratos Comerciais",
    Sports: "Direito Esportivo",
    Water: "Direito de Águas",
    Third_sector: "Terceiro Setor",
    Economic: "Direito Econômico",
    Electoral: "Direito Eleitoral",
    Corporate_criminal: "Direito Penal Empresarial",
    Energy: "Direito de Energia",
    Bankruptcy: "Falência e Recuperação Judicial",
    Family: "Direito de Família",
    Mergers: "Fusões e Aquisições",
    Real_estate: "Direito Imobiliário",
    Import_and_export: "Importação e Exportação",
    Infrastructure: "Infraestrutura",
    International: "Direito Internacional",
    Internet_and_ECommerce: "Internet e Comércio Eletrônico",
    Maritime: "Direito Marítimo",
    Capital_markets: "Mercado de Capitais",
    Mining: "Direito Minerário",
    Financial_operations: "Operações Financeiras",
    Criminal: "Direito Penal",
    Oil_and_gas: "Óleo e Gás",
    Social_security: "Direito Previdenciário",
    Project_finance: "Financiamento de Projetos",
    Intellectual_property: "Propriedade Intelectual",
    Corporate_restructuring: "Reestruturação Empresarial",
    Regulatory: "Direito Regulatório",
    Health_and_sanitary: "Direito Sanitário",
    Insurance: "Seguros",
    Labor_union: "Direito Sindical",
    Corporate: "Direito Empresarial",
    Telecommunications: "Telecomunicações",
    Labor_and_employment: "Direito do Trabalho",
    Tax: "Direito Tributário",
  };

  return (
    translations[area] ||
    area
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
}