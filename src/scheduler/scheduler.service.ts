import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(process.env.REMINDER_CRON || '30 7 * * *')
  async handleDailyReminder() {
    console.log('🔔 Running daily task reminder...');

    const tasks = await this.tasksService.findIncomplete();
    const recipients = await this.usersService.getDirectorsAndVicePrincipals();
    const chatIds = recipients
      .map((u) => u.baleId)
      .filter((id): id is string => id !== null);

    const incompleteTasks = tasks.map((t) => ({
      title: t.title,
      description: t.description || undefined,
    }));

    await this.notificationsService.notifyTaskReminder(
      chatIds,
      incompleteTasks,
    );
  }
}
