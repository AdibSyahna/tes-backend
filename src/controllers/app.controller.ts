import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() { }

  @Get("/")
  @Render('index')
  getIndex() {
    return {
      title: "Tes Backend - PT Data Integrasi Inovasi",
      description: "By M. Adib Mangaraja (adib.syahna@gmail.com)"
    };
   }
}
