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

  /**
   * List schedules with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.schedules.list({ limit: 10 }).next();
   * for (const schedule of page.data) {
   *   console.log(schedule.schedule_id, schedule.memo);
   * }
   * ```
   */
  list(params?: ScheduleListParams): Paginator<Schedule> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/schedules',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('schedules', mapSchedule),
    });
  }

  /**
   * Get a schedule by ID.
   *
   * @example
   * ```ts
   * const schedule = await client.schedules.get('0.0.1234');
   * console.log(schedule.schedule_id, schedule.memo);
   * ```
   */
  async get(scheduleId: string): Promise<Schedule> {
    const response = await this.client.get<unknown>(
      `/api/v1/schedules/${encodeURIComponent(scheduleId)}`,
    );
    return mapSchedule(response.data);
  }
}
