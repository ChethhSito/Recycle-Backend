import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Request, RequestSchema } from "./schema/requests.schema";
import { RequestsController } from "./controller/request.controller";
import { RequestsService } from "./service/request.service";
import { CloudinaryModule } from "src/common/cloudinary.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
        CloudinaryModule
    ],
    controllers: [RequestsController],
    providers: [RequestsService]
})
export class RequestModule { }