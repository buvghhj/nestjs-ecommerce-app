import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Products } from "../schemas/product.schema";
import { Model } from "mongoose";
import { CreateProductDto } from "src/products/dto/create-product.dto";
import { ProductAbstract } from "./abstracts/product.abstract";
import { ParsedOptions } from 'qs-to-mongo/lib/query/options-to-mongo';
import { License } from "../schemas/license.schema";

@Injectable()
export class ProductRepository implements ProductAbstract {

    constructor(
        @InjectModel(Products.name) private readonly productModel: Model<Products>,
        @InjectModel(License.name) private readonly licenseModel: Model<License>
    ) { }

    async create(createProductDto: CreateProductDto) {

        const createdProduct = await this.productModel.create(createProductDto)

        return createdProduct.save()

    }

    async findOne(query: any) {

        const product = await this.productModel.findOne(query)

        return product

    }

    async findOneAndUpdate(query: any, update: any) {

        const updatedProduct = await this.productModel.findOneAndUpdate(query, update, { new: true })

        return updatedProduct

    }

    async find(query: Record<string, any>, options: ParsedOptions) {

        options.sort = options.sort || { _id: 1 }

        options.limit = options.limit || 12

        options.skip = options.skip || 0

        if (query.search) {

            query.productName = new RegExp(query.search, 'i')
            delete query.search

        }

        const products = await this.productModel.aggregate([

            { $match: query },
            { $sort: options.sort },
            { $limit: options.limit }

        ])

        const totalProductCount = await this.productModel.countDocuments(query)

        return { totalProductCount, products }

    }

    async delete(query: any): Promise<any> {

        return await this.productModel.findOneAndDelete(query)

    }

    async findProductWithGroupBy() {

        const products = await this.productModel.aggregate([

            {
                $facet: {
                    latestProducts: [{ $sort: { createdAt: -1 } }, { $limit: 4 }],
                    topRatedProducts: [{ $sort: { avgRating: -1 } }, { $limit: 8 }]
                }
            }

        ])

        return products

    }

    async deleteSku(id: string, skuId: string) {

        return await this.productModel.updateOne(

            { _id: id },

            {
                $pull: {
                    skuDetails: { _id: skuId },
                },
            },

        )

    }

    async deleteAllLicense(productId: string, skuId: string): Promise<any> {

        if (productId) {

            return await this.licenseModel.deleteMany({ product: productId })

        }

        return await this.licenseModel.deleteMany({ productSku: skuId })

    }



    async createLicense(product: string, productSku: string, licenseKey: string) {

        const license = await this.licenseModel.create({ product, productSku, licenseKey })

        return license

    }

    async removeLicens(query: any) {

        const license = await this.licenseModel.findOneAndDelete(query)

        return license

    }

    async getAllLicenses(query: any, limit?: number) {

        if (limit && limit > 0) {

            const licenses = await this.licenseModel.find(query).limit(limit)

            return licenses

        }

        const licenses = await this.licenseModel.find(query)

        return licenses

    }

    async updateProductSkuLicense(query: any, update: any) {

        const updatedLicense = await this.licenseModel.findOneAndUpdate(query, update, { new: true })

        return updatedLicense

    }

    async updateLicenseMany(query: any, data: any) {

        const license = await this.licenseModel.updateMany(query, data)

        return license

    }

}