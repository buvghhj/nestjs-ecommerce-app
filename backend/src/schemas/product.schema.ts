import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum categoryType {
    operatingSystem = 'Operating System',
    applicationSoftware = 'Application Software'
}

export enum platformType {
    window = 'Windows',
    mac = 'Mac',
    linux = 'Linux',
    android = 'Android',
    ios = 'iOS'
}

export enum baseType {
    computer = 'Computer',
    mobile = 'Mobile',
}

@Schema({ timestamps: true })
export class Feedbacks extends mongoose.Document {

    @Prop({})
    customerId: string

    @Prop({})
    customerName: string

    @Prop({})
    rating: number

    @Prop({})
    feedbackMsg: string

}
export const FeedbackSchema = SchemaFactory.createForClass(Feedbacks)

@Schema({ timestamps: true })
export class SkuDetails extends mongoose.Document {

    @Prop({})
    skuName: string

    @Prop({})
    price: number

    @Prop({})
    validity: number

    @Prop({})
    lifetime: boolean

    @Prop({})
    stripePriceId: string

    @Prop({})
    skuCode?: string

}
export const SkuDetailSchema = SchemaFactory.createForClass(SkuDetails)

@Schema({ timestamps: true })
export class Products {

    @Prop({ required: true })
    productName: string

    @Prop({ required: true })
    description: string

    @Prop({ default: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg' })
    image: string

    @Prop({ required: true, enum: [categoryType.applicationSoftware, categoryType.operatingSystem] })
    category: string

    @Prop({ required: true, enum: [platformType.android, platformType.ios, platformType.linux, platformType.mac, platformType.window] })
    platformType: string

    @Prop({ required: true, enum: [baseType.computer, baseType.mobile] })
    baseType: string

    @Prop({ required: true })
    productUrl: string

    @Prop({ required: true })
    downloadUrl: string

    @Prop({})
    avgRating: number

    @Prop([{ type: FeedbackSchema }])
    feedbackDetails: Feedbacks[]

    @Prop([{ type: SkuDetailSchema }])
    skuDetails: SkuDetails[]

    @Prop({ type: Object })
    imageDetails: Record<string, any>

    @Prop({})
    requirementSpecification: Record<string, any>[]

    @Prop({})
    hightlights: string[]

    @Prop({})
    stripeProductId: string

}
export const ProductSchema = SchemaFactory.createForClass(Products)