import { Injectable } from '@nestjs/common';
import { BaleService } from '../../bale/bale.service';
import { UsersService } from '../../users/users.service';
import { ClassesService } from '../../classes/classes.service';
import { StudentsService } from '../../students/students.service';
import { UserRole } from '../../users/user.entity';
import {
  userManagementKeyboard,
  classManagementKeyboard,
  studentManagementKeyboard,
  cancelOrBackKeyboard,
} from '../keyboards/keyboards';

export interface ConversationState {
  step: string;
  data?: any;
}

@Injectable()
export class AdminHandler {
  private conversations = new Map<string, ConversationState>();

  constructor(
    private readonly baleService: BaleService,
    private readonly usersService: UsersService,
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
  ) {}

  cancel(chatId: string) {
    this.conversations.delete(chatId);
  }

  async handle(
    chatId: string,
    text: string,
    callbackData?: string,
  ): Promise<boolean> {
    if (callbackData === 'admin:users') {
      await this.baleService.sendMessage(
        chatId,
        '👥 مدیریت کاربران',
        userManagementKeyboard(),
      );
      return true;
    }

    if (callbackData === 'admin:classes') {
      await this.baleService.sendMessage(
        chatId,
        '🏫 مدیریت کلاس‌ها',
        classManagementKeyboard(),
      );
      return true;
    }

    if (callbackData === 'admin:students') {
      await this.baleService.sendMessage(
        chatId,
        '👨‍🎓 مدیریت دانش‌آموزان',
        studentManagementKeyboard(),
      );
      return true;
    }

    if (callbackData === 'admin:list_users') {
      const users = await this.usersService.findAll();
      if (users.length === 0) {
        await this.baleService.sendMessage(chatId, 'هیچ کاربری ثبت نشده است.');
      } else {
        const roleLabels: Record<string, string> = {
          ADMIN: 'مدیر سیستم',
          DIRECTOR: 'مدیر مدرسه',
          VICE_PRINCIPAL: 'معاون',
          TEACHER: 'آموزگار',
        };
        const list = users
          .map(
            (u) =>
              `- ${u.name} (${roleLabels[u.role]}) - Bale ID: ${u.baleId || 'ثبت نشده'}`,
          )
          .join('\n');
        await this.baleService.sendMessage(
          chatId,
          `👥 لیست کاربران:\n\n${list}`,
        );
      }
      await this.baleService.sendMessage(chatId, '', userManagementKeyboard());
      return true;
    }

    if (callbackData === 'admin:add_director') {
  this.conversations.set(chatId, {
    step: 'waiting_director_name',
  });

  await this.baleService.sendMessage(
    chatId,
    'نام مدیر مدرسه را وارد کنید:',
    cancelOrBackKeyboard('cancel', 'panel:admin'),
  );

  return true;
}

    if (callbackData === 'admin:add_vice') {
  this.conversations.set(chatId, {
    step: 'waiting_vice_name',
  });

  await this.baleService.sendMessage(
    chatId,
    'نام معاون را وارد کنید:',
    cancelOrBackKeyboard('cancel', 'panel:admin'),
  );

  return true;
}

    if (callbackData === 'admin:add_teacher') {
  this.conversations.set(chatId, {
    step: 'waiting_teacher_name',
  });

  await this.baleService.sendMessage(
    chatId,
    'نام آموزگار را وارد کنید:',
    cancelOrBackKeyboard('cancel', 'panel:admin'),
  );

  return true;
}

    if (callbackData === 'admin:add_class') {
      this.conversations.set(chatId, { step: 'waiting_class_name' });
      await this.baleService.sendMessage(
        chatId,
        'نام کلاس را وارد کنید (مثال: کلاس اول الف):',
        cancelOrBackKeyboard('cancel', 'panel:admin'),
      );
      return true;
    }

    if (callbackData === 'admin:list_classes') {
      const classes = await this.classesService.findAll();
      if (classes.length === 0) {
        await this.baleService.sendMessage(chatId, 'هیچ کلاسی ثبت نشده است.');
      } else {
        const list = classes
          .map(
            (c) =>
              `- ${c.name}${c.teacher ? ` (معلم: ${c.teacher.name})` : ''}`,
          )
          .join('\n');
        await this.baleService.sendMessage(
          chatId,
          `🏫 لیست کلاس‌ها:\n\n${list}`,
        );
      }
      await this.baleService.sendMessage(chatId, '', classManagementKeyboard());
      return true;
    }

    if (callbackData === 'admin:assign_teacher') {
      const classes = await this.classesService.findAll();
      if (classes.length === 0) {
        await this.baleService.sendMessage(chatId, '⚠️ ابتدا کلاس ایجاد کنید.');
        return true;
      }
      this.conversations.set(chatId, {
        step: 'selecting_class_for_teacher',
        data: { classes },
      });
      const list = classes.map((c, i) => `${i + 1}- ${c.name}`).join('\n');
      await this.baleService.sendMessage(
        chatId,
        `شماره کلاس را وارد کنید:\n\n${list}`,
        cancelOrBackKeyboard('cancel', 'panel:admin'),
      );
      return true;
    }

    if (callbackData === 'admin:add_student') {
      const classes = await this.classesService.findAll();
      if (classes.length === 0) {
        await this.baleService.sendMessage(chatId, '⚠️ ابتدا کلاس ایجاد کنید.');
        return true;
      }
      this.conversations.set(chatId, {
        step: 'selecting_class_for_student',
        data: { classes },
      });
      const list = classes.map((c, i) => `${i + 1}- ${c.name}`).join('\n');
      await this.baleService.sendMessage(
        chatId,
        `کلاس دانش‌آموز را انتخاب کنید:\n\n${list}`,
        cancelOrBackKeyboard('cancel', 'panel:admin'),
      );
      return true;
    }

    if (callbackData === 'admin:list_students') {
      const students = await this.studentsService.findAll();
      if (students.length === 0) {
        await this.baleService.sendMessage(
          chatId,
          'هیچ دانش‌آموزی ثبت نشده است.',
        );
      } else {
        const grouped = new Map<string, string[]>();
        for (const s of students) {
          const className = s.schoolClass?.name || 'نامشخص';
          if (!grouped.has(className)) grouped.set(className, []);
          grouped.get(className)!.push(s.name);
        }
        let msg = '👨‍🎓 لیست دانش‌آموزان:\n\n';
        for (const [cls, names] of grouped) {
          msg += `🏫 ${cls}:\n${names.map((n) => `  - ${n}`).join('\n')}\n\n`;
        }
        await this.baleService.sendMessage(chatId, msg);
      }
      await this.baleService.sendMessage(
        chatId,
        '',
        studentManagementKeyboard(),
      );
      return true;
    }

    const state = this.conversations.get(chatId);
    if (!state) return false;

   if (state.step === 'waiting_director_name') {

  this.conversations.set(chatId, {
    step: 'waiting_director_bale_id',
    data: {
      name: text,
    },
  });

  await this.baleService.sendMessage(
    chatId,
    'شناسه بله (Bale ID) مدیر را وارد کنید:',
    cancelOrBackKeyboard('cancel', 'panel:admin'),
  );

  return true;
}

  if (state.step === 'waiting_director_bale_id') {

  await this.usersService.create({
    name: state.data.name,
    baleId: text,
    role: UserRole.DIRECTOR,
  });

  this.conversations.delete(chatId);

  await this.baleService.sendMessage(
    chatId,
    `✅ مدیر «${state.data.name}» با شناسه ${text} اضافه شد.`,
    userManagementKeyboard(),
  );

  return true;
}

    if (state.step === 'waiting_vice_name') {

  this.conversations.set(chatId,{
    step:'waiting_vice_bale_id',
    data:{
      name:text
    }
  });

  await this.baleService.sendMessage(
    chatId,
    'شناسه بله معاون را وارد کنید:',
    cancelOrBackKeyboard('cancel','panel:admin')
  );

  return true;
}


if(state.step === 'waiting_vice_bale_id'){

  await this.usersService.create({
    name:state.data.name,
    baleId:text,
    role:UserRole.VICE_PRINCIPAL
  });


  this.conversations.delete(chatId);


  await this.baleService.sendMessage(
    chatId,
    `✅ معاون «${state.data.name}» اضافه شد.`,
    userManagementKeyboard()
  );

  return true;
}

    if(state.step === 'waiting_teacher_name'){

  this.conversations.set(chatId,{
    step:'waiting_teacher_bale_id',
    data:{
      name:text
    }
  });


  await this.baleService.sendMessage(
    chatId,
    'شناسه بله آموزگار را وارد کنید:',
    cancelOrBackKeyboard('cancel','panel:admin')
  );


  return true;
}



if(state.step === 'waiting_teacher_bale_id'){

  await this.usersService.create({
    name:state.data.name,
    baleId:text,
    role:UserRole.TEACHER
  });


  this.conversations.delete(chatId);


  await this.baleService.sendMessage(
    chatId,
    `✅ آموزگار «${state.data.name}» اضافه شد.`,
    userManagementKeyboard()
  );


  return true;
}

    if (state.step === 'waiting_class_name') {
      await this.classesService.create({ name: text });
      this.conversations.delete(chatId);
      await this.baleService.sendMessage(
        chatId,
        `✅ کلاس «${text}» ایجاد شد.`,
        classManagementKeyboard(),
      );
      return true;
    }

    if (state.step === 'selecting_class_for_teacher') {
      const index = Number(text) - 1;
      const classes = state.data.classes;
      if (isNaN(index) || index < 0 || index >= classes.length) {
        await this.baleService.sendMessage(
          chatId,
          'لطفاً یک شماره معتبر وارد کنید:',
        );
        return true;
      }
      const selectedClass = classes[index];
      const teachers = await this.usersService.findByRole(UserRole.TEACHER);
      if (teachers.length === 0) {
        await this.baleService.sendMessage(
          chatId,
          '⚠️ هیچ معلمی ثبت نشده.',
          classManagementKeyboard(),
        );
        this.conversations.delete(chatId);
        return true;
      }
      this.conversations.set(chatId, {
        step: 'selecting_teacher_for_class',
        data: {
          classId: selectedClass.id,
          className: selectedClass.name,
          teachers,
        },
      });
      const list = teachers.map((t, i) => `${i + 1}- ${t.name}`).join('\n');
      await this.baleService.sendMessage(
        chatId,
        `شماره معلم را برای کلاس «${selectedClass.name}» وارد کنید:\n\n${list}`,
        cancelOrBackKeyboard('cancel', 'panel:admin'),
      );
      return true;
    }

    if (state.step === 'selecting_teacher_for_class') {
      const index = Number(text) - 1;
      const teachers = state.data.teachers;
      if (isNaN(index) || index < 0 || index >= teachers.length) {
        await this.baleService.sendMessage(
          chatId,
          'لطفاً یک شماره معتبر وارد کنید:',
        );
        return true;
      }
      const selectedTeacher = teachers[index];
      await this.classesService.update(state.data.classId, {
        teacherId: selectedTeacher.id,
      });
      this.conversations.delete(chatId);
      await this.baleService.sendMessage(
        chatId,
        `✅ معلم «${selectedTeacher.name}» به کلاس «${state.data.className}» متصل شد.`,
        classManagementKeyboard(),
      );
      return true;
    }

    if (state.step === 'selecting_class_for_student') {
      const index = Number(text) - 1;
      const classes = state.data.classes;
      if (isNaN(index) || index < 0 || index >= classes.length) {
        await this.baleService.sendMessage(
          chatId,
          'لطفاً یک شماره معتبر وارد کنید:',
        );
        return true;
      }
      const selectedClass = classes[index];
      this.conversations.set(chatId, {
        step: 'waiting_student_name',
        data: { classId: selectedClass.id, className: selectedClass.name },
      });
      await this.baleService.sendMessage(
        chatId,
        `نام دانش‌آموز را برای کلاس «${selectedClass.name}» وارد کنید:`,
        cancelOrBackKeyboard('cancel', 'panel:admin'),
      );
      return true;
    }

    if (state.step === 'waiting_student_name') {
      await this.studentsService.create({
        name: text,
        classId: state.data.classId,
      });
      this.conversations.delete(chatId);
      await this.baleService.sendMessage(
        chatId,
        `✅ دانش‌آموز «${text}» به کلاس «${state.data.className}» اضافه شد.`,
        studentManagementKeyboard(),
      );
      return true;
    }

    return false;
  }
}
