import {
    //  Body,
    Controller,
    //  Get,
    //  Path,
    Post,
    Query,
    Route,
    //  SuccessResponse,
} from "tsoa";
import { APIService } from "./apiService";

@Route("api")
export class APIController extends Controller {

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    */
    @Post("injection")
    public async injectEnergy(
        @Query() publicKey: string,
        @Query() energySupply: number
        //@Body() requestBody: ProsumerInj
    ): Promise<string> {

        return new APIService().injectEnergy({
            publicKey: publicKey,
            energySupply: energySupply
        });

    }

    /**
    * Posts a bid to the blockchain.
    * Supply public key of bidder, the energy demand, and the bid price
    * @param publicKey The public key of the bidding user
    * @param demand The energy demand of the user
    * @param price The bid price of the user
    */
    @Post("bid")
    public async bidOnEnergy(
        @Query() publicKey: string,
        @Query() demand: number,
        @Query() price: number
        //@Body() requestBody: ConsumerBid
    ): Promise<string> {

        return new APIService().bidOnEnergy({
            publicKey: publicKey,
            demand: demand,
            price: price
        });

    }

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    @Post("util")
    public async utiliseEnergy(
        @Query() publicKey: string,
        @Query() energyTokenStorage: string
        //@Body() requestBody: ConsumerUtil
    ): Promise<string> {

        return new APIService().utiliseEnergy({
            publicKey: publicKey,
            energyTokenStorage: energyTokenStorage
        });

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
