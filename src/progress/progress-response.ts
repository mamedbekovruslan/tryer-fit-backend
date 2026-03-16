import { ProgressReport } from './progress-report.entity';
import { ProgressReportComment } from './progress-report-comment.entity';
import {
  ClientResponse,
  toClientResponse,
  TrainerResponse,
  toTrainerResponse,
} from '../users/user-response';

export interface ProgressReportCommentResponse {
  id: number;
  comment: string;
  trainer?: TrainerResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressReportResponse {
  id: number;
  date: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
  client?: ClientResponse;
  comments?: ProgressReportCommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export function toProgressReportCommentResponse(
  comment: ProgressReportComment,
): ProgressReportCommentResponse {
  return {
    id: comment.id,
    comment: comment.comment,
    trainer: comment.trainer ? toTrainerResponse(comment.trainer) : undefined,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export function toProgressReportResponse(
  report: ProgressReport,
): ProgressReportResponse {
  return {
    id: report.id,
    date: report.date,
    weight: report.weight,
    waist: report.waist,
    hips: report.hips,
    chest: report.chest,
    arms: report.arms,
    thighs: report.thighs,
    bodyFat: report.bodyFat,
    muscleMass: report.muscleMass,
    notes: report.notes,
    photoUrls: report.photoUrls,
    client: report.client ? toClientResponse(report.client) : undefined,
    comments: report.comments?.map(toProgressReportCommentResponse),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}
