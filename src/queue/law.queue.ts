import { Queue } from 'bullmq';
import { connection } from './redis';

export const lawQueue = new Queue('laws', {
  connection,
});