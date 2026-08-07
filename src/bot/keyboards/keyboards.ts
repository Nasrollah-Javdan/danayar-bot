import {
  InlineKeyboardButton,
  ReplyKeyboardButton,
} from '../../bale/bale.service';

export function adminPanelKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '👥 مدیریت کاربران', callback_data: 'admin:users' }],
      [{ text: '🏫 مدیریت کلاس‌ها', callback_data: 'admin:classes' }],
      [{ text: '👨‍🎓 مدیریت دانش‌آموزان', callback_data: 'admin:students' }],
      [{ text: '🔔 یادآوری کارها', callback_data: 'reminder:now' }],
    ],
  };
}

export function directorPanelKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '➕ کار جدید', callback_data: 'task:create' }],
      [{ text: '📌 کارهای انجام‌نشده', callback_data: 'task:list' }],
      [{ text: '🔔 یادآوری کارها', callback_data: 'reminder:now' }],
    ],
  };
}

export function vicePrincipalPanelKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '➕ کار جدید', callback_data: 'task:create' }],
      [{ text: '📌 کارهای انجام‌نشده', callback_data: 'task:list' }],
      [{ text: '🔔 یادآوری کارها', callback_data: 'reminder:now' }],
    ],
  };
}

export function teacherPanelKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '📋 حضور و غیاب', callback_data: 'attendance:start' }],
    ],
  };
}

export function cancelKeyboard(callbackData: string): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [[{ text: '❌ لغو', callback_data: callbackData }]],
  };
}

export function backKeyboard(callbackData: string): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [[{ text: '⬅️ بازگشت', callback_data: callbackData }]],
  };
}

export function cancelOrBackKeyboard(
  cancelData: string,
  backData: string,
): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [
        { text: '⬅️ بازگشت', callback_data: backData },
        { text: '❌ لغو', callback_data: cancelData },
      ],
    ],
  };
}

export function confirmKeyboard(
  confirmData: string,
  cancelData: string,
): { inline_keyboard: InlineKeyboardButton[][] } {
  return {
    inline_keyboard: [
      [
        { text: '✅ تایید', callback_data: confirmData },
        { text: '❌ لغو', callback_data: cancelData },
      ],
    ],
  };
}

export function classSelectionKeyboard(
  classes: { id: number; name: string }[],
): { inline_keyboard: InlineKeyboardButton[][] } {
  const rows: InlineKeyboardButton[][] = [];

  for (const cls of classes) {
    rows.push([
      { text: `🏫 ${cls.name}`, callback_data: `attendance:class:${cls.id}` },
    ]);
  }

  rows.push([{ text: '❌ لغو', callback_data: 'panel:teacher' }]);

  return { inline_keyboard: rows };
}

export function attendanceStudentKeyboard(
  students: { id: number; name: string; isAbsent: boolean }[],
): { inline_keyboard: InlineKeyboardButton[][] } {
  const rows: InlineKeyboardButton[][] = [];

  for (const student of students) {
    const icon = student.isAbsent ? '❌' : '✅';
    rows.push([
      {
        text: `${icon} ${student.name}`,
        callback_data: `attendance:toggle:${student.id}`,
      },
    ]);
  }

  rows.push([
    { text: '📤 ارسال گزارش', callback_data: 'attendance:submit' },
    { text: '❌ لغو', callback_data: 'panel:teacher' },
  ]);

  return { inline_keyboard: rows };
}

export function userManagementKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '➕ افزودن مدیر', callback_data: 'admin:add_director' }],
      [{ text: '➕ افزودن معاون', callback_data: 'admin:add_vice' }],
      [{ text: '➕ افزودن معلم', callback_data: 'admin:add_teacher' }],
      [{ text: '👥 لیست کاربران', callback_data: 'admin:list_users' }],
      [{ text: '🔙 بازگشت', callback_data: 'panel:admin' }],
    ],
  };
}

export function classManagementKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '➕ ایجاد کلاس', callback_data: 'admin:add_class' }],
      [{ text: '📋 لیست کلاس‌ها', callback_data: 'admin:list_classes' }],
      [
        {
          text: '🔗 اتصال معلم به کلاس',
          callback_data: 'admin:assign_teacher',
        },
      ],
      [{ text: '🔙 بازگشت', callback_data: 'panel:admin' }],
    ],
  };
}

export function studentManagementKeyboard(): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [
      [{ text: '➕ افزودن دانش‌آموز', callback_data: 'admin:add_student' }],
      [{ text: '📋 لیست دانش‌آموزان', callback_data: 'admin:list_students' }],
      [{ text: '📥 ورود گروهی از فایل', callback_data: 'admin:bulk_import' }],
      [{ text: '🔙 بازگشت', callback_data: 'panel:admin' }],
    ],
  };
}

export function adminReplyKeyboard(): {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard: boolean;
} {
  return {
    keyboard: [
      [{ text: '👥 مدیریت کاربران' }, { text: '🏫 مدیریت کلاس‌ها' }],
      [{ text: '👨‍🎓 مدیریت دانش‌آموزان' }, { text: '🔔 یادآوری کارها' }],
    ],
    resize_keyboard: true,
  };
}

export function directorReplyKeyboard(): {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard: boolean;
} {
  return {
    keyboard: [
      [{ text: '➕ کار جدید' }, { text: '📌 کارهای انجام‌نشده' }],
      [{ text: '🔔 یادآوری کارها' }],
    ],
    resize_keyboard: true,
  };
}

export function vicePrincipalReplyKeyboard(): {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard: boolean;
} {
  return {
    keyboard: [
      [{ text: '➕ کار جدید' }, { text: '📌 کارهای انجام‌نشده' }],
      [{ text: '🔔 یادآوری کارها' }],
    ],
    resize_keyboard: true,
  };
}

export function teacherReplyKeyboard(): {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard: boolean;
} {
  return {
    keyboard: [[{ text: '📋 حضور و غیاب' }]],
    resize_keyboard: true,
  };
}
