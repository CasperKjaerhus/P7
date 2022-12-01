import {
    //  Body,
    Controller,
    //  Get,
    //  Path,
    Post,
    //  Query,
    Route,
    //  SuccessResponse,
} from "tsoa";
//import { ConsumerBid, ConsumerUtil, ProsumerInj } from "./user";
//import { APIService } from "./usersService";

@Route("api")
export class APIController extends Controller {
    @Post("injection")
    public async injectEnergy(
        //@Body() requestBody: ProsumerInj
    ): Promise<void> {


        return;
    }

    @Post("bid")
    public async bidOnEnergy(
        //@Body() requestBody: ConsumerBid
    ): Promise<void> {


        return;
    }

    @Post("util")
    public async utiliseEnergy(
        //@Body() requestBody: ConsumerUtil
    ): Promise<void> {

        return;
    }
}
/*
@Route("users")
export class UsersController extends Controller {
    @Get("{userId}")
    public async getUser(
        @Path() userId: number,
        @Query() name?: string
    ): Promise<User> {
        return new UsersService().get(userId, name);
    }

    @SuccessResponse("201", "Created") // Custom success response
    @Post()
    public async createUser(
        @Body() requestBody: UserCreationParams
    ): Promise<void> {
        this.setStatus(201); // set return status 201
        new UsersService().create(requestBody);
        return;
    }
}*/
