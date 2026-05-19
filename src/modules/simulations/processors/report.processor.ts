import { ReportService } from "@m/ai/services/report.service";
import { GenerateReportJob } from "@modules/common/interfaces/interfaces";
import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job } from "bull";

@Processor('simulation-reports')
export class ReportProcessor {
    private readonly logger = new Logger(ReportProcessor.name)

    constructor(
        private readonly reportService: ReportService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @Process('generate-report')
    async handleGenerateReport(job: Job<GenerateReportJob>) {
        const { simulationId } = job.data

        this.logger.log(`Gerando report para simulação ${simulationId}`)

        const report = await this.reportService.generate(simulationId)

        this.eventEmitter.emit('simulation.report.ready', {
            simulationId,
            reportId: report.id,
            userId: report.user_id,
        })

        this.logger.log(`Report gerado com sucesso: ${report.id}`);

        return report;

    }

    @OnQueueFailed()
    handleFailure(job: Job<GenerateReportJob>, error: Error) {
        this.logger.error(
            `Falha ao gerar report para simulação ${job.data.simulationId}: ${error.message}`,
            error.stack,
        );
    }
}