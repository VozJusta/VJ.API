import { ReportService } from "@m/ai/services/report.service";
import { GenerateReportJob } from "@modules/common/interfaces/interfaces";
import { Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job } from "bull";

@Processor('simulation-reports')
export class ReportProcessor {
    private readonly logger = new Logger(ReportProcessor.name)

    constructor(
        private readonly reportService: ReportService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @Process('generate-report')
    async handleGenerateReport(job: Job<GenerateReportJob>) {
        const { simulationId } = job.data

        this.logger.log(`Gerando report para simulação ${simulationId}`)

        const report = await this.reportService.generate()

        this.eventEmitter.emit('simulation.report.ready', {
            simulationId,
            reportId: report
        })
    }
}