import { Injectable } from '@nestjs/common';
import { BaleService } from '../../bale/bale.service';
import { UsersService } from '../../users/users.service';
import { ClassesService } from '../../classes/classes.service';
import { StudentsService } from '../../students/students.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  teacherPanelKeyboard,
  classSelectionKeyboard,
  attendanceStudentKeyboard,
  cancelOrBackKeyboard,
} from '../keyboards/keyboards';

export interface AttendanceConversationState {
  step: string;
  classId?: number;
  className?: string;
  teacherId?: number;
  teacherName?: string;
  students?: { id: number; name: string; isAbsent: boolean }[];
  absentIds?: number[];
}

@Injectable()
export class TeacherHandler {
  private conversations = new Map<string, AttendanceConversationState>();

  constructor(
    private readonly baleService: BaleService,
    private readonly usersService: UsersService,
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
    private readonly attendanceService: AttendanceService,
    private readonly notificationsService: NotificationsService,
  ) {}

  cancel(chatId: string) {
    this.conversations.delete(chatId);
  }

  async handle(
    chatId: string,
    text: string,
    callbackData?: string,
  ): Promise<boolean> {
    if (callbackData === 'attendance:start') {
      const user = await this.usersService.findByBaleId(chatId);
      if (!user) {
        await this.baleService.sendMessage(chatId, '⚠️ کاربر شما یافت نشد.');
        return true;
      }

      const classes = await this.classesService.findByTeacherId(user.id);
      if (classes.length === 0) {
        await this.baleService.sendMessage(
          chatId,
          '⚠️ هیچ کلاسی به شما اختصاص داده نشده است.',
          teacherPanelKeyboard(),
        );
        return true;
      }

      this.conversations.set(chatId, {
        step: 'selecting_class',
        teacherId: user.id,
        teacherName: user.name,
      });
      await this.baleService.sendMessage(
        chatId,
        'کلاس مورد نظر را انتخاب کنید:',
        classSelectionKeyboard(classes),
      );
      return true;
    }

    if (callbackData?.startsWith('attendance:class:')) {
      const classId = Number(callbackData.split(':')[2]);
      const schoolClass = await this.classesService.findById(classId);
      if (!schoolClass) {
        await this.baleService.sendMessage(chatId, '⚠️ کلاس یافت نشد.');
        return true;
      }

      const students = await this.studentsService.findByClassId(classId);
      if (students.length === 0) {
        await this.baleService.sendMessage(
          chatId,
          '⚠️ هیچ دانش‌آموزی در این کلاس ثبت نشده.',
          teacherPanelKeyboard(),
        );
        return true;
      }

      const state = this.conversations.get(chatId);

      this.conversations.set(chatId, {
        step: 'selecting_absent',
        classId,
        className: schoolClass.name,
        teacherId: state?.teacherId || 0,
        teacherName: state?.teacherName || 'ناشناخته',
        students: students.map((s) => ({
          id: s.id,
          name: s.name,
          isAbsent: false,
        })),
      });

      await this.baleService.sendMessage(
        chatId,
        `📋 حضور و غیاب کلاس ${schoolClass.name}\n\nروی دانش‌آموزان غایب کلیک کنید:`,
        attendanceStudentKeyboard(
          students.map((s) => ({ id: s.id, name: s.name, isAbsent: false })),
        ),
      );
      return true;
    }

    if (callbackData?.startsWith('attendance:toggle:')) {
      const studentId = Number(callbackData.split(':')[2]);
      const state = this.conversations.get(chatId);
      if (!state || !state.students) return false;

      const student = state.students.find((s) => s.id === studentId);
      if (student) {
        student.isAbsent = !student.isAbsent;
      }

      await this.baleService.sendMessage(
        chatId,
        `📋 حضور و غیاب کلاس ${state.className}\n\nروی دانش‌آموزان غایب کلیک کنید:`,
        attendanceStudentKeyboard(state.students),
      );
      return true;
    }

    if (callbackData === 'attendance:submit') {
      const state = this.conversations.get(chatId);
      if (!state || !state.students) return false;

      const absentStudents = state.students.filter((s) => s.isAbsent);
      state.absentIds = absentStudents.map((s) => s.id);

      if (absentStudents.length === 0) {
        await this.baleService.sendMessage(
          chatId,
          'آیا مطمئن هستید؟\n\nهمه دانش‌آموزان حاضر هستند.',
          {
            inline_keyboard: [
              [
                { text: '✅ تایید', callback_data: 'attendance:confirm' },
                { text: '❌ لغو', callback_data: 'panel:teacher' },
              ],
            ],
          },
        );
      } else {
        const absentNames = absentStudents.map((s) => `- ${s.name}`).join('\n');
        await this.baleService.sendMessage(
          chatId,
          `آیا این دانش‌آموزان غایب هستند؟\n\n${absentNames}`,
          {
            inline_keyboard: [
              [
                { text: '✅ تایید', callback_data: 'attendance:confirm' },
                { text: '❌ لغو', callback_data: 'panel:teacher' },
              ],
            ],
          },
        );
      }

      state.step = 'confirming';
      return true;
    }

    if (callbackData === 'attendance:confirm') {
      const state = this.conversations.get(chatId);
      if (!state) return false;

      if (state.absentIds && state.absentIds.length > 0) {
        state.step = 'waiting_note';
        await this.baleService.sendMessage(
          chatId,
          'توضیحات (اختیاری) را وارد کنید یا /skip بزنید:',
          cancelOrBackKeyboard('panel:teacher', 'panel:teacher'),
        );
      } else {
        await this.finalizeAttendance(chatId, state, '');
      }
      return true;
    }

    if (callbackData === 'panel:teacher') {
      this.conversations.delete(chatId);
      await this.baleService.sendMessage(
        chatId,
        '👨‍🏫 پنل آموزگار',
        teacherPanelKeyboard(),
      );
      return true;
    }

    const state = this.conversations.get(chatId);
    if (!state) return false;

    if (state.step === 'waiting_note') {
      const note = text === '/skip' ? '' : text;
      await this.finalizeAttendance(chatId, state, note);
      return true;
    }

    return false;
  }

  private async finalizeAttendance(
    chatId: string,
    state: AttendanceConversationState,
    note: string,
  ) {
    const today = new Date().toISOString().split('T')[0];

    if (state.absentIds && state.absentIds.length > 0 && state.classId) {
      const dtos = state.absentIds.map((studentId) => ({
        studentId,
        classId: state.classId!,
        teacherId: state.teacherId || 0,
        date: today,
        isAbsent: true,
        note,
      }));

      await this.attendanceService.bulkCreate(dtos);

      await this.attendanceService.createRecord({
        classId: state.classId,
        teacherId: state.teacherId || 0,
        date: today,
        hasAbsence: true,
        description: note,
      });

      const absentNames =
        state.students?.filter((s) => s.isAbsent).map((s) => s.name) || [];

      await this.notificationsService.notifyAttendanceReport(
        state.className || '',
        absentNames,
        state.teacherName || 'ناشناخته',
        note,
      );
    } else {
      if (state.classId) {
        await this.attendanceService.createRecord({
          classId: state.classId,
          teacherId: state.teacherId || 0,
          date: today,
          hasAbsence: false,
        });
      }

      await this.notificationsService.notifyAttendanceReport(
        state.className || '',
        [],
        state.teacherName || 'ناشناخته',
      );
    }

    this.conversations.delete(chatId);
    await this.baleService.sendMessage(
      chatId,
      '✅ گزارش حضور و غیاب با موفقیت ثبت شد.',
      teacherPanelKeyboard(),
    );
  }
}
