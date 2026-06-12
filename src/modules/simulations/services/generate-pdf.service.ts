import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import * as path from "path";
import PDFDocument from "pdfkit";
import * as fs from "fs";

const LOGO_PATH = path.join(process.cwd(), "src", "modules", "common", "images", "logo-name.png");

const C = {
  primary: "#1A3557",
  accent:  "#C8A96E",
  text:    "#2D2D2D",
  muted:   "#6B7280",
  light:   "#F3F6FA",
  white:   "#FFFFFF",
  border:  "#D1D5DB",
};
 
const FOOTER_H = 50;
 
@Injectable()
export class GeneratePdfService {
  constructor(private prisma: PrismaService) {}
 
  async generateSimulationReportPdf(id: string, res: Response) {
    const simulationReport = await this.prisma.simulationReport.findUnique({
      where: { id },
      include: { simulation: true, user: true },
    });
 
    if (!simulationReport) throw new NotFoundException("Relatório de simulação não encontrado");
 
    const metrics = simulationReport.metrics_json
      ? (simulationReport.metrics_json as Record<string, unknown>) : {};
 
    const data = {
      score:            simulationReport.score ?? 0,
      strengths:        simulationReport.strengths ?? [],
      weaknesses:       simulationReport.weaknesses ?? [],
      personality:      simulationReport.personality,
      duration_secs:    simulationReport.duration_secs ?? 0,
      metrics,
      created_at:       simulationReport.created_at,
      participant:      simulationReport.user?.full_name ?? "Não informado",
    };
 
    const doc = new PDFDocument({ margin: 0, size: "A4", bufferPages: true });
 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=simulation-report-${Date.now()}.pdf`);
    doc.pipe(res);
 
    const W  = doc.page.width;
    const H  = doc.page.height;
    const L  = 50;
    const CW = W - L * 2;
 
    doc.rect(0, 0, W, 110).fill(C.primary);
    doc.rect(0, 0, W, 5).fill(C.accent);
 
    const temLogo = fs.existsSync(LOGO_PATH);
    if (temLogo) doc.image(LOGO_PATH, L, 18, { fit: [140, 60] });
 
    const tx = temLogo ? L + 155 : L;
    const tw = CW - (temLogo ? 155 : 0);
 
    doc.fillColor(C.white).fontSize(22).font("Helvetica-Bold")
      .text("Relatório de Simulação", tx, 30, { width: tw });
    doc.fillColor(C.accent).fontSize(10).font("Helvetica")
      .text(`Emitido em: ${data.created_at.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`, tx, 58, { width: tw });
 
    let y = 130;
 
    y = secao(doc, "Participante",          data.participant,                           y, L, CW, H);
    y = secao(doc, "Personalidade",         formatarPersonalidade(data.personality),    y, L, CW, H);
    y = barraScore(doc, data.score,                                                     y, L, CW, H);
    y = secao(doc, "Duração da Simulação",  formatarDuracao(data.duration_secs),        y, L, CW, H);
 
    const textoPontosFortes = data.strengths.length > 0
      ? data.strengths.map(s => `• ${s}`).join("\n")
      : "Nenhum ponto forte registrado.";
    y = secao(doc, "Pontos Fortes",         textoPontosFortes,                          y, L, CW, H);
 
    const textoPontosMelhoria = data.weaknesses.length > 0
      ? data.weaknesses.map(w => `• ${w}`).join("\n")
      : "Nenhum ponto de melhoria registrado.";
    y = secao(doc, "Pontos de Melhoria",    textoPontosMelhoria,                        y, L, CW, H);
 
    const entradas = Object.entries(data.metrics);
    if (entradas.length > 0) {
      const textoMetricas = entradas.map(([k, v]) => `${formatarChaveMetrica(k)}: ${v}`).join("\n");
      y = secao(doc, "Métricas",            textoMetricas,                              y, L, CW, H);
    }
 
    const totalPaginas = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPaginas; i++) {
      doc.switchToPage(i);
      doc.rect(0, H - FOOTER_H, W, FOOTER_H).fill(C.primary);
      doc.fillColor(C.white).fontSize(8).font("Helvetica")
        .text("Este relatório foi gerado automaticamente para fins de avaliação da simulação.",
          L, H - 32, { width: CW, align: "center" });
    }
 
    doc.end();
  }
}
 
 
function garantirEspaco(doc: PDFKit.PDFDocument, alturaMinima: number, y: number, H: number): number {
  if (y + alturaMinima > H - FOOTER_H - 20) {
    doc.addPage();
    return 30;
  }
  return y;
}
 
function dividirEmLinhas(doc: PDFKit.PDFDocument, texto: string, largura: number): string[] {
  doc.fontSize(10).font("Helvetica");
  const linhas: string[] = [];
 
  for (const paragrafo of texto.split("\n")) {
    const palavras = paragrafo.split(" ");
    let atual = "";
    for (const palavra of palavras) {
      if (!palavra) continue;
      const teste = atual ? `${atual} ${palavra}` : palavra;
      if (doc.widthOfString(teste) > largura && atual) {
        linhas.push(atual);
        atual = palavra;
      } else {
        atual = teste;
      }
    }
    linhas.push(atual);
  }
 
  return linhas.filter((l, i, arr) => l !== "" || (i > 0 && arr[i - 1] !== ""));
}
 
function secao(
  doc: PDFKit.PDFDocument, titulo: string, conteudo: string,
  y: number, L: number, CW: number, H: number
): number {
  if (!conteudo) return y;
 
  const disponivel = H - FOOTER_H - 20;
 
  y = garantirEspaco(doc, 16 + 10 + 40, y, H);
 
  doc.fillColor(C.primary).fontSize(12).font("Helvetica-Bold").text(titulo.toUpperCase(), L, y);
  y += 16;
  doc.rect(L, y, 40, 2).fill(C.accent);
  y += 10;
 
  doc.fontSize(10).font("Helvetica");
  const alturaLinha = doc.currentLineHeight(true) + 3;
  const linhas = dividirEmLinhas(doc, conteudo, CW - 24);
  let i = 0;
 
  while (i < linhas.length) {
    const espacoParaConteudo = disponivel - y - 20;
    const linhasQueCabem = Math.max(1, Math.floor(espacoParaConteudo / alturaLinha));
    const trecho = linhas.slice(i, i + linhasQueCabem).join("\n");
    const alturaBloco = doc.heightOfString(trecho, { width: CW - 24, lineGap: 3 }) + 20;
 
    doc.roundedRect(L, y, CW, alturaBloco, 4).fill(C.light);
    doc.fillColor(C.text).fontSize(10).font("Helvetica")
      .text(trecho, L + 12, y + 10, { width: CW - 24, lineGap: 3 });
 
    y += alturaBloco;
    i += linhasQueCabem;
 
    if (i < linhas.length) {
      doc.addPage();
      y = 30;
    }
  }
 
  return y + 20;
}
 
function barraScore(
  doc: PDFKit.PDFDocument, score: number,
  y: number, L: number, CW: number, H: number
): number {
  const pct = Math.min(Math.max(score, 0), 100);
 
  y = garantirEspaco(doc, 60, y, H);
 
  doc.fillColor(C.primary).fontSize(12).font("Helvetica-Bold").text("PONTUAÇÃO", L, y);
  y += 20;
 
  doc.roundedRect(L, y, CW, 12, 6).fill(C.border);
  const cor = pct >= 70 ? "#22C55E" : pct >= 60 ? "#F59E0B" : "#EF4444";
  if (pct > 0) doc.roundedRect(L, y, (CW * pct) / 100, 12, 6).fill(cor);
  doc.fillColor(C.muted).fontSize(10).font("Helvetica").text(`${pct}/100`, L + CW + 8, y);
 
  return y + 40; // retorna y atualizado
}
 
function formatarPersonalidade(personalidade: string): string {
  const mapa: Record<string, string> = {
    AGGRESSIVE: "Agressivo", PASSIVE: "Passivo", ASSERTIVE: "Assertivo",
    COLLABORATIVE: "Colaborativo", ANALYTICAL: "Analítico", CALM: "Calmo",
  };
  return mapa[personalidade?.toUpperCase()] ?? personalidade;
}
 
function formatarDuracao(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return m === 0 ? `${s}s` : `${m}min ${s}s`;
}
 
function formatarChaveMetrica(chave: string): string {
  return chave.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}