import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaleService } from '../bale/bale.service';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';

import { UserRole } from '../users/user.entity';

import { AdminHandler } from './handlers/admin.handler';
import { DirectorHandler } from './handlers/director.handler';
import { TeacherHandler } from './handlers/teacher.handler';

import {
  adminReplyKeyboard,
  directorReplyKeyboard,
  vicePrincipalReplyKeyboard,
  teacherReplyKeyboard,

  adminPanelKeyboard,
  directorPanelKeyboard,
  vicePrincipalPanelKeyboard,
  teacherPanelKeyboard,

} from './keyboards/keyboards';


@Injectable()
export class BotService implements OnModuleInit {

private readonly adminId: string | undefined;

constructor(

private readonly baleService:BaleService,

private readonly usersService:UsersService,

private readonly tasksService:TasksService,

private readonly notificationsService:NotificationsService,

private readonly adminHandler:AdminHandler,

private readonly directorHandler:DirectorHandler,

private readonly teacherHandler:TeacherHandler,

private readonly configService:ConfigService,


){

this.adminId =
this.configService.get<string>('ADMIN_ID');

}



async onModuleInit(){

this.baleService.onUpdate(
(update)=>this.handleUpdate(update)
);

}



async handleUpdate(update:any){


const message = update.message;

const callbackQuery = update.callback_query;



if(callbackQuery){

await this.handleCallbackQuery(callbackQuery);

return;

}



if(!message)
return;



const chatId = String(message.chat.id);

const text = message.text || '';



if(text === '/start'){

await this.handleStart(message);

return;

}



await this.routeMessage(
message
);



}





private async handleUnknownUserLog(
message:any,
event:string
){


const chatId = String(message.chat.id);


const username =
message.from?.first_name ||
message.from?.username ||
'نامشخص';



const text = `

🚨 کاربر ناشناس

📌 رویداد:
${event}


👤 نام:
${username}


🆔 Bale ID:
${chatId}


💬 پیام:
${message.text || '-'}


`;



if(this.adminId){

await this.baleService.sendMessage(
this.adminId,
text
);

}


}






async handleStart(message:any){


const chatId =
String(message.chat.id);



const user =
await this.usersService.findByBaleId(chatId);



if(!user){


await this.handleUnknownUserLog(
message,
'/start'
);


// هیچ پاسخی به کاربر نمی‌دهیم

return;

}



await this.sendPanelByRole(
chatId,
user.role
);


}





async routeMessage(message:any){


const chatId =
String(message.chat.id);


const text =
message.text || '';



const user =
await this.usersService.findByBaleId(chatId);



if(!user){


await this.handleUnknownUserLog(
message,
'message'
);


// هیچ پاسخی به کاربر نمی‌دهیم

return;

}



switch(user.role){


case UserRole.ADMIN:


if(text==='👥 مدیریت کاربران'){

await this.adminHandler.handle(
chatId,
text,
'admin:users'
);

}
else if(text==='🏫 مدیریت کلاس‌ها'){

await this.adminHandler.handle(
chatId,
text,
'admin:classes'
);

}
else if(text==='👨‍🎓 مدیریت دانش‌آموزان'){

await this.adminHandler.handle(
chatId,
text,
'admin:students'
);

}
else{

await this.adminHandler.handle(
chatId,
text
);

}


break;



case UserRole.DIRECTOR:

case UserRole.VICE_PRINCIPAL:


await this.directorHandler.handle(
chatId,
text


);


break;



case UserRole.TEACHER:


await this.teacherHandler.handle(
chatId,
text
);


break;


}



}







async sendPanelByRole(
chatId:string,
role:UserRole
){


switch(role){


case UserRole.ADMIN:

await this.baleService.sendMessage(
chatId,
'🔧 پنل مدیریت سیستم',
adminReplyKeyboard()
);

break;



case UserRole.DIRECTOR:

await this.baleService.sendMessage(
chatId,
'🏫 پنل مدیریت',
directorReplyKeyboard()
);

break;



case UserRole.VICE_PRINCIPAL:

await this.baleService.sendMessage(
chatId,
'👩‍💼 پنل معاونت',
vicePrincipalReplyKeyboard()
);

break;



case UserRole.TEACHER:

await this.baleService.sendMessage(
chatId,
'👨‍🏫 پنل آموزگار',
teacherReplyKeyboard()
);

break;


}


}






async handleCallbackQuery(callbackQuery:any){

  const chatId =
    String(
      callbackQuery.message?.chat?.id ||
      callbackQuery.from?.id
    );

  const callbackData =
    callbackQuery.data;


  if(!chatId || !callbackData)
    return;


  console.log(
    'CALLBACK:',
    callbackData,
    'CHAT:',
    chatId
  );


  await this.baleService.answerCallbackQuery(
    callbackQuery.id
  );

  if(callbackData.startsWith('panel:')){

  await this.handlePanelNavigation(
    chatId,
    callbackData
  );

  return;

}


if(callbackData === 'reminder:now'){

  await this.handleManualReminder(chatId);

  return;

}

  // مدیریت کاربران
  if(callbackData.startsWith('admin:')){

    await this.adminHandler.handle(
      chatId,
      '',
      callbackData
    );

    return;
  }


  // مدیریت کارها
  if(callbackData.startsWith('task:')){

    await this.directorHandler.handle(
      chatId,
      '',
      callbackData
    );

    return;
  }


  // حضور و غیاب
  if(callbackData.startsWith('attendance:')){

    await this.teacherHandler.handle(
      chatId,
      '',
      callbackData
    );

    return;
  }
  


  // دکمه بازگشت پنل‌ها
  if(callbackData.startsWith('panel:')){

    await this.handlePanelNavigation(
      chatId,
      callbackData
    );

    return;
  }


  // یادآوری
  if(callbackData === 'reminder:now'){

    await this.handleManualReminder(chatId);

    return;
  }

  

}


async handlePanelNavigation(
  chatId: string,
  callbackData: string,
) {

  switch(callbackData) {


    case 'panel:admin':

      await this.baleService.sendMessage(
        chatId,
        '🔧 پنل مدیریت سیستم',
        adminPanelKeyboard(),
      );

      break;



    case 'panel:director':

      await this.baleService.sendMessage(
        chatId,
        '🏫 پنل مدیریت',
        directorPanelKeyboard(),
      );

      break;



    case 'panel:vice_principal':

      await this.baleService.sendMessage(
        chatId,
        '👩‍💼 پنل معاونت',
        vicePrincipalPanelKeyboard(),
      );

      break;



    case 'panel:teacher':

      await this.baleService.sendMessage(
        chatId,
        '👨‍🏫 پنل آموزگار',
        teacherPanelKeyboard(),
      );

      break;

  }

}

async handleManualReminder(chatId:string){

  const tasks =
    await this.tasksService.findIncomplete();



  if(tasks.length === 0){


    await this.baleService.sendMessage(
      chatId,
      '✅ امروز هیچ کار انجام‌نشده‌ای وجود ندارد.',
    );


    return;

  }




  const taskList = tasks

    .map(
      (t,index)=>
      `${index+1}- ${t.title}`
    )

    .join('\n');




  const message =

`🔔 یادآوری کارهای انجام‌نشده

${taskList}

لطفاً موارد باقی‌مانده را بررسی کنید.`;





  const users =
    await this.usersService.getDirectorsAndVicePrincipals();




  const ids = users

    .map(u=>u.baleId)

    .filter(
      (id): id is string =>
      Boolean(id)
    );




  if(!ids.includes(chatId)){

    ids.push(chatId);

  }




  for(const id of ids){

    await this.baleService.sendMessage(
      id,
      message,
    );

  }


}


}