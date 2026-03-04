import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Program, ProgramSchema } from "./schema/program.schema";
import { ProgramsController } from "./controller/program.controller";
import { ProgramsService } from "./service/program.service";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Program.name, schema: ProgramSchema }]),
        UsersModule
    ],
    controllers: [ProgramsController],
    providers: [ProgramsService],
    exports: [ProgramsService],
})
export class ProgramsModule { }
