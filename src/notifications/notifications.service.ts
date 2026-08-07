import { Injectable } from '@nestjs/common';
import { BaleService } from '../bale/bale.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly baleService: BaleService,
    private readonly usersService: UsersService,
  ) {}

  async notifyNewTask(title: string, description: string) {
    const recipients = await this.usersService.getDirectorsAndVicePrincipals();

    const text = `📌 کار جدید

عنوان:
${title}

توضیحات:
${description}`;

    for (const user of recipients) {
      if (user.baleId) {
        await this.baleService.sendMessage(user.baleId, text);
      }
    }
  }

  async notifyTaskCompleted(
    title: string,
    completedByName: string,
    completedAt: Date,
  ) {
    const recipients = await this.usersService.getDirectorsAndVicePrincipals();

    const time = completedAt.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const text = `✅ کار انجام شد

کار:
${title}

انجام‌دهنده:
${completedByName}

زمان:
${time}`;

    for (const user of recipients) {
      if (user.baleId) {
        await this.baleService.sendMessage(user.baleId, text);
      }
    }
  }

  async notifyAttendanceReport(
    className: string,
    absentNames: string[],
    teacherName: string,
    note?: string,
  ) {
    const recipients = await this.usersService.getDirectorsAndVicePrincipals();

    const time = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let text: string;

    if (absentNames.length === 0) {
      text = `📢 گزارش حضور و غیاب

کلاس:
${className}

وضعیت:
✅ همه دانش‌آموزان حاضر هستند.

ثبت‌کننده:
${teacherName}

زمان:
${time}`;
    } else {
      const absentList = absentNames.map((n) => `- ${n}`).join('\n');
      text = `📢 گزارش حضور و غیاب

کلاس:
${className}

غایبین:

${absentList}`;

      if (note) {
        text += `

توضیحات:
${note}`;
      }

      text += `

ثبت‌کننده:
${teacherName}

زمان:
${time}`;
    }

    for (const user of recipients) {
      if (user.baleId) {
        await this.baleService.sendMessage(user.baleId, text);
      }
    }
  }

  async notifyTaskReminder(
    chatIds: string[],
    incompleteTasks: { title: string; description?: string }[],
  ) {
    if (incompleteTasks.length === 0) {
      const text = '✅ امروز هیچ کار انجام‌نشده‌ای وجود ندارد.';
      for (const chatId of chatIds) {
        await this.baleService.sendMessage(chatId, text);
      }
      return;
    }

    const taskList = incompleteTasks
      .map((t, i) => `${i + 1}- ${t.title}`)
      .join('\n');

    const text = `🔔 یادآوری کارهای انجام‌نشده

لیست کارها:

${taskList}

لطفاً موارد باقی‌مانده را بررسی کنید.`;

    for (const chatId of chatIds) {
      await this.baleService.sendMessage(chatId, text);
    }
  }
}
