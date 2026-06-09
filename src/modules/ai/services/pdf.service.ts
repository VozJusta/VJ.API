import { Injectable, NotFoundException } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { Response } from "express";
import { PrismaService } from "@m/prisma/service/prisma.service";
import * as path from "path";
import * as fs from "fs";

const LOGO_PATH = path.join(process.cwd(), "src", "modules", "ai", "services", "images", "logo-name.png");

const C = {
  primary: "#1A3557",
  accent:  "#C8A96E",
  text:    "#2D2D2D",
  muted:   "#6B7280",
  light:   "#F3F6FA",
  white:   "#FFFFFF",
  border:  "#D1D5DB",
};
 
@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}
 
  async generateReportPdf(id: string, res: Response) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { ai_versions: true },
    });
    if (!report) throw new NotFoundException("Relatório não encontrado");
 
    const aiData = report.ai_versions?.[0]
      ? JSON.parse(report.ai_versions[0].response) : {};
 
    const data = {
      input:       report.transcription,
      area:        report.category_detected,
      analysis:    report.legal_analysis,
      explanation: report.simplified_explanation,
      next_steps:  aiData.next_steps || [],
      confidence:  aiData.confidence || 0,
    };
 
    // Reserva espaço para o rodapé — o conteúdo para antes dele
    const FOOTER_H = 50;
 
    const doc = new PDFDocument({
      margin: 0,
      size: "A4",
      bufferPages: true, // permite escrever o rodapé em todas as páginas no final
    });
 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=report-${Date.now()}.pdf`);
    doc.pipe(res);
 
    const W  = doc.page.width;
    const H  = doc.page.height;
    const L  = 50;
    const CW = W - L * 2;
 
    // ── Header ────────────────────────────────────────────────────
    doc.rect(0, 0, W, 110).fill(C.primary);
    doc.rect(0, 0, W, 5).fill(C.accent);
 
    const hasLogo = fs.existsSync(LOGO_PATH);
    if (hasLogo) doc.image(LOGO_PATH, L, 18, { fit: [140, 60] });
 
    const tx = hasLogo ? L + 155 : L;
    const tw = CW - (hasLogo ? 155 : 0);
 
    doc.fillColor(C.white).fontSize(22).font("Helvetica-Bold")
      .text("Relatório Jurídico", tx, 30, { width: tw });
    doc.fillColor(C.accent).fontSize(10).font("Helvetica")
      .text(`Emitido em: ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`, tx, 58, { width: tw });
 
    // ── Area badge (altura dinâmica) ───────────────────────────────
    let y = 130;
    const areaLabel = formatArea(data.area);
    const badgePadX = 14;
    const badgePadY = 8;
    // Mede a largura real do texto com a fonte correta antes de qualquer cálculo
    doc.font("Helvetica-Bold").fontSize(10);
    const badgeTextW = doc.widthOfString(areaLabel);
    const badgeW = Math.min(badgeTextW + badgePadX * 2, CW);
    const badgeH = doc.heightOfString(areaLabel, { width: badgeW - badgePadX * 2 }) + badgePadY * 2;
 
    doc.roundedRect(L, y, badgeW, badgeH, 5).fill(C.primary);
    doc.fillColor(C.white).fontSize(10).font("Helvetica-Bold")
      .text(areaLabel, L + badgePadX, y + badgePadY, { width: badgeW - badgePadX * 2, lineGap: 2 });
    y += badgeH + 18;
 
    // ── Sections ──────────────────────────────────────────────────
    y = section(doc, "Relato",                 data.input,       y, L, CW, W, H, FOOTER_H);
    y = section(doc, "Análise Jurídica",        data.analysis,    y, L, CW, W, H, FOOTER_H);
    y = section(doc, "Explicação Simplificada", data.explanation, y, L, CW, W, H, FOOTER_H);
    if (data.next_steps.length) y = nextSteps(doc, data.next_steps, y, L, CW, W, H, FOOTER_H);
    confidenceBar(doc, data.confidence, y, L, CW);
 
    // ── Rodapé em todas as páginas ────────────────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.rect(0, H - FOOTER_H, W, FOOTER_H).fill(C.primary);
      doc.fillColor(C.muted).fontSize(8).font("Helvetica")
        .text(
          "Este relatório foi gerado automaticamente e não substitui a orientação de um advogado habilitado.",
          L, H - 32, { width: CW, align: "center" }
        );
    }
 
    doc.end();
  }
}
 
// ── Helpers ───────────────────────────────────────────────────────────────────
 
/** Garante espaço antes de desenhar; adiciona nova página se necessário. */
function ensureSpace(doc: PDFKit.PDFDocument, neededH: number, y: number, H: number, footerH: number, L: number, CW: number): number {
  if (y + neededH > H - footerH - 20) {
    doc.addPage();
    return 30; // margem no topo da nova página (o header já não é repetido)
  }
  return y;
}
 
function section(
  doc: PDFKit.PDFDocument, title: string, content: string,
  y: number, L: number, CW: number, W: number, H: number, footerH: number
): number {
  if (!content) return y;
 
  const textH = doc.heightOfString(content, { width: CW - 24 });
  const blockH = 16 + 10 + textH + 20 + 20; // título + separador + caixa + espaço
 
  y = ensureSpace(doc, blockH, y, H, footerH, L, CW);
 
  doc.fillColor(C.primary).fontSize(12).font("Helvetica-Bold").text(title.toUpperCase(), L, y);
  y += 16;
  doc.rect(L, y, 40, 2).fill(C.accent);
  y += 10;
  const bh = textH + 20;
  doc.roundedRect(L, y, CW, bh, 4).fill(C.light);
  doc.fillColor(C.text).fontSize(10).font("Helvetica")
    .text(content, L + 12, y + 10, { width: CW - 24, lineGap: 3 });
  return y + bh + 20;
}
 
function nextSteps(
  doc: PDFKit.PDFDocument, steps: string[],
  y: number, L: number, CW: number, W: number, H: number, footerH: number
): number {
  y = ensureSpace(doc, 50, y, H, footerH, L, CW);
  doc.fillColor(C.primary).fontSize(12).font("Helvetica-Bold").text("PRÓXIMOS PASSOS", L, y);
  y += 16;
  doc.rect(L, y, 40, 2).fill(C.accent);
  y += 10;
 
  steps.forEach((step, i) => {
    const rh = doc.heightOfString(step, { width: CW - 50 }) + 16;
    y = ensureSpace(doc, rh + 6, y, H, footerH, L, CW);
    doc.circle(L + 12, y + rh / 2, 11).fill(C.primary);
    doc.fillColor(C.white).fontSize(9).font("Helvetica-Bold")
      .text(`${i + 1}`, L + 7, y + rh / 2 - 6, { width: 12, align: "center" });
    doc.fillColor(C.text).fontSize(10).font("Helvetica")
      .text(step, L + 32, y + 8, { width: CW - 40, lineGap: 3 });
    y += rh + 6;
  });
  return y + 14;
}
 
function confidenceBar(doc: PDFKit.PDFDocument, confidence: number, y: number, L: number, CW: number): void {
  const pct = Math.min(Math.max(confidence, 0), 100);
  doc.fillColor(C.primary).fontSize(12).font("Helvetica-Bold").text("NÍVEL DE CONFIANÇA", L, y);
  y += 20;
  doc.roundedRect(L, y, CW, 12, 6).fill(C.border);
  if (pct > 0) {
    const fill = pct >= 70 ? "#22C55E" : pct >= 40 ? "#F59E0B" : "#EF4444";
    doc.roundedRect(L, y, (CW * pct) / 100, 12, 6).fill(fill);
  }
  doc.fillColor(C.muted).fontSize(10).font("Helvetica").text(`${pct}%`, L + CW + 8, y);
}
 
function formatArea(area: string): string {
  const map: Record<string, string> = {
    Administrative:"Direito Administrativo", Customs:"Direito Aduaneiro", Legal_support:"Suporte Jurídico",
    Aviation:"Direito Aeronáutico", Agrarian:"Direito Agrário", Environmental:"Direito Ambiental",
    Arbitration:"Arbitragem", Copyright:"Direitos Autorais", Banking_and_financial:"Direito Bancário e Financeiro",
    Biotechnology:"Biotecnologia", Civil:"Direito Civil", Commercial:"Direito Comercial",
    International_trade:"Comércio Internacional", Competition:"Direito da Concorrência", Constitutional:"Direito Constitucional",
    Consumer:"Direito do Consumidor", Commercial_contracts:"Contratos Comerciais", Sports:"Direito Esportivo",
    Water:"Direito de Águas", Third_sector:"Terceiro Setor", Economic:"Direito Econômico",
    Electoral:"Direito Eleitoral", Corporate_criminal:"Direito Penal Empresarial", Energy:"Direito de Energia",
    Bankruptcy:"Falência e Recuperação Judicial", Family:"Direito de Família", Mergers:"Fusões e Aquisições",
    Real_estate:"Direito Imobiliário", Import_and_export:"Importação e Exportação", Infrastructure:"Infraestrutura",
    International:"Direito Internacional", Internet_and_ECommerce:"Internet e Comércio Eletrônico", Maritime:"Direito Marítimo",
    Capital_markets:"Mercado de Capitais", Mining:"Direito Minerário", Financial_operations:"Operações Financeiras",
    Criminal:"Direito Penal", Oil_and_gas:"Óleo e Gás", Social_security:"Direito Previdenciário",
    Project_finance:"Financiamento de Projetos", Intellectual_property:"Propriedade Intelectual",
    Corporate_restructuring:"Reestruturação Empresarial", Regulatory:"Direito Regulatório",
    Health_and_sanitary:"Direito Sanitário", Insurance:"Seguros", Labor_union:"Direito Sindical",
    Corporate:"Direito Empresarial", Telecommunications:"Telecomunicações", Labor_and_employment:"Direito do Trabalho",
    Tax:"Direito Tributário",
  };
  return map[area] ?? area.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}