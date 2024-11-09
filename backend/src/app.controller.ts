import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";

@Controller()
export class AppController {

    @Get('/csrf-token')
    getScrfToken(@Req() req: Request): any {

        return { result: req.csrfToken() }

    }

}