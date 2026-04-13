export class AnalyticsDataPointDTO {
  date!: string;
  value!: number;
}

export class LawyerAnalyticsResponseDTO {
  data!: AnalyticsDataPointDTO[];
}
