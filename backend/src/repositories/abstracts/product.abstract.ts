import { Products } from "../../schemas/product.schema";
import { CreateProductDto } from "../../products/dto/create-product.dto";

export abstract class ProductAbstract {

    abstract create(createProductDto: CreateProductDto): Promise<any>

    abstract findOne(query: any): Promise<any>

    abstract findOneAndUpdate(query: any, update: any): Promise<any>

    abstract find(query: any, options: any): Promise<any>

    abstract delete(query: any): Promise<any>

    abstract findProductWithGroupBy(): Promise<any>

    abstract createLicense(productId: string, skuId: string, licenseKey: string): Promise<any>

}