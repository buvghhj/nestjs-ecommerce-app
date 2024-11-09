import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/schemas/user.schema";
import { UserAbstract } from "./abstracts/user.abstact";

@Injectable()
export class UserRepository implements UserAbstract {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async findOne(query: any) {

        return await this.userModel.findOne(query)

    }

    async find(query: any) {

        return await this.userModel.find(query)

    }

    async create(data: Record<string, any>) {

        return await this.userModel.create(data)

    }

    async updateOne(query: any, data: Record<string, any>) {

        return await this.userModel.updateOne(query, data)

    }

    async getUserDetailById(id: string) {

        return await this.userModel.findById(id)

    }

}