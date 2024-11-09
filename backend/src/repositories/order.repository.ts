import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Orders } from "../schemas/order.schema";

@Injectable()
export class OrderRepository {

    constructor(@InjectModel(Orders.name) private readonly orderModel: Model<Orders>) { }

    async findOrders(query: any) {

        const orders = await this.orderModel.find(query)

        return orders

    }

    async findOneOrder(query: any) {

        const order = await this.orderModel.findOne(query)

        return order

    }

    async createOrder(order: any) {

        const newOrder = await this.orderModel.create(order)

        return newOrder
    }

    async findOneAndUpdate(query: any, update: any, options: any) {

        const order = await this.orderModel.findOneAndUpdate(query, update, options)

        return order

    }

}