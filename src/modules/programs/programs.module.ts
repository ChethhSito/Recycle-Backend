import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Program, ProgramSchema } from "./schema/program.schema";
import { ProgramsController } from "./controller/program.controller";
import { ProgramsService } from "./service/program.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: Program.name, schema: ProgramSchema }])],
    controllers: [ProgramsController],
    providers: [ProgramsService],
    exports: [ProgramsService],
})
export class ProgramsModule { }
