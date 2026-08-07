import { Injectable } from '@nestjs/common';

import { BaleService } from '../../bale/bale.service';
import { TasksService } from '../../tasks/tasks.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { UsersService } from '../../users/users.service';

import {
  directorPanelKeyboard,
  cancelOrBackKeyboard,
} from '../keyboards/keyboards';


export interface TaskConversationState {
  step: string;
  data?: any;
}


@Injectable()
export class DirectorHandler {


  private conversations = new Map<string, TaskConversationState>();


  constructor(

    private readonly baleService: BaleService,

    private readonly tasksService: TasksService,

    private readonly notificationsService: NotificationsService,

    private readonly usersService: UsersService,

  ) {}




  cancel(chatId:string){

    this.conversations.delete(chatId);

  }





  async handle(

    chatId:string,

    text:string,

    callbackData?:string,

  ):Promise<boolean>{



    console.log(
      'DirectorHandler:',
      {
        chatId,
        text,
        callbackData
      }
    );




    /*
      ایجاد کار جدید
      هم Reply Keyboard
      هم Inline Keyboard
    */

    if(
      text === '➕ کار جدید' ||
      callbackData === 'task:create'
    ){


      this.conversations.set(
        chatId,
        {
          step:'waiting_title'
        }
      );


      await this.baleService.sendMessage(

        chatId,

        '📝 عنوان کار را وارد کنید:',

        cancelOrBackKeyboard(
          'cancel',
          'panel:director'
        )

      );


      return true;

    }






    /*
       نمایش کارهای انجام نشده
    */


    if(

      text === '📌 کارهای انجام‌نشده' ||
      callbackData === 'task:list'

    ){


      const tasks =
        await this.tasksService.findIncomplete();



      if(tasks.length === 0){


        await this.baleService.sendMessage(

          chatId,

          '✅ هیچ کار انجام‌نشده‌ای وجود ندارد.'

        );


      }

      else{


        const list = tasks

          .map(

            (task,index)=>{


              let item =
                `${index+1}- ${task.title}`;


              if(task.description){

                item +=
                `\n   ${task.description}`;

              }


              return item;

            }

          )

          .join('\n\n');



        await this.baleService.sendMessage(

          chatId,

          `📌 کارهای انجام‌نشده:\n\n${list}`

        );


      }




      await this.baleService.sendMessage(

        chatId,

        'پنل مدیریت',

        directorPanelKeyboard()

      );


      return true;


    }








    /*
       تکمیل کار
    */


    if(

      callbackData?.startsWith(
        'task:complete:'
      )

    ){


      const taskId =
        Number(
          callbackData.split(':')[2]
        );



      const task =
        await this.tasksService.findById(taskId);



      if(task){


        const user =
          await this.usersService.findByBaleId(chatId);



        if(user){


          await this.tasksService.complete(

            taskId,

            user.id

          );



          await this.notificationsService.notifyTaskCompleted(

            task.title,

            user.name,

            new Date()

          );



          await this.baleService.sendMessage(

            chatId,

            '✅ کار انجام شد.'

          );


        }


      }


      return true;


    }







    /*
       ادامه مراحل ساخت کار
    */


    const state =
      this.conversations.get(chatId);



    if(!state)

      return false;







    /*
       گرفتن عنوان
    */


    if(

      state.step === 'waiting_title'

    ){



      this.conversations.set(

        chatId,

        {

          step:'waiting_description',

          data:{

            title:text

          }

        }

      );



      await this.baleService.sendMessage(

        chatId,

        '📄 توضیحات کار را وارد کنید یا /skip بزنید:',


        cancelOrBackKeyboard(

          'cancel',

          'panel:director'

        )

      );



      return true;


    }








    /*
       گرفتن توضیحات و ذخیره
    */


    if(

      state.step === 'waiting_description'

    ){



      const description =

        text === '/skip'

        ?

        ''

        :

        text;





      const task =

        await this.tasksService.create(

          {

            title:
              state.data.title,


            description

          }

        );






      await this.notificationsService.notifyNewTask(

        task.title,

        task.description || ''

      );





      this.conversations.delete(chatId);





      await this.baleService.sendMessage(

        chatId,

        '✅ کار جدید ایجاد شد و اطلاع‌رسانی انجام شد.',

        directorPanelKeyboard()

      );



      return true;


    }







    return false;


  }


}