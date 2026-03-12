/**
 * Schedules resource — 2 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapSchedule } from '../mappers/schedule.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type { Schedule, ScheduleListParams } from '../types/schedules.js';

export class SchedulesResource {
  constructor(private readonly client: HttpClient) {}

  list(params?: ScheduleListParams): Paginator<Schedule> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/schedules',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('schedules', mapSchedule),
    });
  }

  async get(scheduleId: string): Promise<Schedule> {
    const response = await this.client.get<unknown>(
      `/api/v1/schedules/${encodeURIComponent(scheduleId)}`,
    );
    return mapSchedule(response.data);
  }
}
