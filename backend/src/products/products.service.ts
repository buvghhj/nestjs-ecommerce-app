import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from '../repositories/product.repository';
import Stripe from 'stripe';
import { InjectStripe } from 'nestjs-stripe';
import { GetProductQueryDto } from './dto/get-product-query.dto';
import qs2m from 'qs-to-mongo';
import cloudinary from 'cloudinary'
import config from 'config'
import { unlinkSync } from 'fs';
import { ProductSkuDto, ProductSkuDtoArr } from './dto/product-sku.dto';
import { OrderRepository } from 'src/repositories/order.repository';

@Injectable()
export class ProductsService {

  constructor(
    @Inject(ProductRepository) private readonly productModel: ProductRepository,
    @Inject(OrderRepository) private readonly orderModel: OrderRepository,
    @InjectStripe() private readonly stripeClient: Stripe
  ) {

    cloudinary.v2.config({
      cloud_name: config.get('cloudinary.cloudinary'),
      api_key: config.get('cloudinary.api_key'),
      api_secret: config.get('cloudinary.api_secret')
    })

  }

  async createProduct(createProductDto: CreateProductDto) {

    try {

      if (!createProductDto.stripeProductId) {

        const createdProductStripe = await this.stripeClient.products.create({

          name: createProductDto.productName,
          description: createProductDto.description

        })

        createProductDto.stripeProductId = createdProductStripe.id

      }

      const createdProductInDB = await this.productModel.create(createProductDto)

      return {
        success: true,
        message: 'Product created successfully',
        result: createdProductInDB
      }

    } catch (error) {

      throw error

    }

  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {

    try {

      const productExist = await this.productModel.findOne({ _id: id })

      if (!productExist) {

        throw new Error('Product does not exist')

      }

      const updateProduct = await this.productModel.findOneAndUpdate({ _id: id }, updateProductDto)

      if (!updateProductDto.stripeProductId) {

        await this.stripeClient.products.update(
          productExist.stripeProductId,
          {
            name: updateProductDto.productName,
            description: updateProductDto.description
          }
        )

      }

      return {
        success: true,
        message: 'Product updated successfully',
        result: updateProduct
      }

    } catch (error) {

      throw error

    }

  }

  async findAllProducts(query: GetProductQueryDto) {

    try {

      let callForHomePage = false

      if (query.homepage) {

        callForHomePage = true

      }

      delete query.homepage

      const { criteria, options, links } = qs2m(query)

      if (callForHomePage) {

        const products = await this.productModel.findProductWithGroupBy()

        return {
          success: true,
          message: products.length > 0 ? 'Products found successfully' : 'No product found',
          result: products
        }

      } else {

        const { totalProductCount, products } = await this.productModel.find(criteria, options)

        return {

          success: true,

          message: products.length > 0 ? 'Products found successfully' : 'No product found',

          result: {

            metadata: {
              skip: options.skip || 0,
              limit: options.limit || 10,
              total: totalProductCount,
              pages: options.limit ? Math.ceil(totalProductCount / options.limit) : 1,
              links: links('/', totalProductCount)
            },

            products

          }

        }

      }

    } catch (error) {

      throw error

    }

  }

  async findOneProduct(id: string) {

    try {

      const product = await this.productModel.findOne({ _id: id })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const relatedProducts = await this.productModel.find(
        {
          category: product.category,
          _id: { $ne: id }
        },
        {
          limit: 4,
          projection: {},
          sort: { createdAt: -1 },
          skip: 0
        }
      )

      return {
        success: true,
        message: 'Product found successfully',
        result: { product, relatedProducts }
      }

    } catch (error) {

      throw error

    }

  }

  async removeProduct(id: string) {

    try {

      const productExist = await this.productModel.findOne({ _id: id })

      if (!productExist) {

        throw new Error('Product does not exist')

      }

      await this.productModel.delete({ _id: id })

      await this.stripeClient.products.del(productExist.stripeProductId)

      return {
        success: true,
        message: 'Deleted product successfully',
        result: null
      }

    } catch (error) {

      throw error

    }

  }

  async uploadProductImage(id: string, file: any) {

    try {

      const product = await this.productModel.findOne({ _id: id })

      if (!product) {

        throw new Error('Product does not exist')

      }

      if (product.imageDetails?.public_id) {

        await cloudinary.v2.uploader.destroy(product.imageDetails.public_id, { invalidate: true })

      }

      const resOfCloudinary = await cloudinary.v2.uploader.upload(

        file.path,
        {
          folder: config.get('cloudinary.folderPath'),

          product_id: `${config.get('cloudinary.publicId_prefix')}${Date.now()}`,

          transformation: [
            {
              width: config.get('cloudinary.bigSize').toString().split('X')[0],
              height: config.get('cloudinary.bigSize').toString().split('X')[1],
              crop: 'fill'
            },
            { quality: 'auto' }
          ]
        }

      )

      unlinkSync(file.path)

      await this.productModel.findOneAndUpdate(

        { _id: id },

        {
          imageDetails: resOfCloudinary,
          image: resOfCloudinary.secure_url
        }

      )

      await this.stripeClient.products.update(product.stripeProductId, { images: [resOfCloudinary.secure_url] })

      return {
        success: true,
        message: 'Image uploaded successfully',
        result: resOfCloudinary.secure_url
      }

    } catch (error) {

      throw error

    }

  }

  async createProductSku(productId: string, productSkuDto: ProductSkuDtoArr) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const skuCode = Math.random().toString(36).substring(2, 5) + Date.now()

      for (let i = 0; i < productSkuDto.skuDetails.length; i++) {

        if (!productSkuDto.skuDetails[i].stripePriceId) {

          const stripePriceDetails = await this.stripeClient.prices.create({

            unit_amount: productSkuDto.skuDetails[i].price * 100,

            currency: 'inr',

            product: product.stripeProductId,

            metadata: {
              skuCode: skuCode,
              lifetime: productSkuDto.skuDetails[i].lifetime + '',
              product: productId,
              price: productSkuDto.skuDetails[i].price,
              productName: product.productName,
              productImage: product.image
            },

          })

          productSkuDto.skuDetails[i].stripePriceId = stripePriceDetails.id

        }

        productSkuDto.skuDetails[i].skuCode = skuCode

      }

      await this.productModel.findOneAndUpdate(
        {
          _id: productId
        },
        {
          $push: { skuDetails: productSkuDto.skuDetails }
        }
      )

      return {
        success: true,
        message: 'Product sku created successfully',
        result: null
      }

    } catch (error) {

      throw error

    }

  }

  async updateProductSkuById(productId: string, skuId: string, updateProductSkuDto: ProductSkuDto) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const sku = product.skuDetails.find((sku) => sku._id.toString() === skuId)

      if (!sku) {

        throw new Error('Sku does not exist')

      }

      if (updateProductSkuDto.price !== sku.price) {

        const pricesDetails = await this.stripeClient.prices.create({

          unit_amount: updateProductSkuDto.price * 100,

          currency: 'inr',

          product: product.stripeProductId,

          metadata: {
            skuCode: sku.skuCode,
            lifetime: updateProductSkuDto.lifetime + '',
            product: product.stripeProductId,
            price: updateProductSkuDto.price,
            productName: product.productName,
            productImage: product.image
          }

        })

        updateProductSkuDto.stripePriceId = pricesDetails.id

      }

      const dataForUpdate = {}

      for (const key in updateProductSkuDto) {

        if (updateProductSkuDto.hasOwnProperty(key)) {

          dataForUpdate[`skuDetails.$.${key}`] = updateProductSkuDto[key]

        }

      }

      const result = await this.productModel.findOneAndUpdate(
        {
          _id: productId,
          'skuDetails._id': skuId
        },
        {
          $set: dataForUpdate
        }
      )

      return {
        success: true,
        message: 'Product sku updated successfully',
        result
      }

    } catch (error) {

      throw error

    }

  }

  async removeProductSkuById(productId: string, skuId: string) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const sku = product.skuDetails.find((sku) => sku._id.toString() === skuId)

      if (!sku) {

        throw new Error('Sku does not exist')

      }

      await this.stripeClient.prices.update(sku.stripePriceId, { active: false })

      await this.productModel.deleteSku(productId, skuId)

      await this.productModel.deleteAllLicense(undefined, skuId)

      return {
        success: true,
        message: 'Product sku removed successfully',
        result: { productId, skuId }
      }

    } catch (error) {

      throw error

    }

  }

  async addProductSkuLicense(productId: string, skuId: string, licenseKey: string) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const sku = product.skuDetails.find((sku => sku._id.toString() === skuId))

      if (!sku) {

        throw new Error('Sku does not exist')

      }

      const result = await this.productModel.createLicense(productId, skuId, licenseKey)

      return {
        success: true,
        message: 'License added successfully',
        result: result
      }

    } catch (error) {

      throw error

    }

  }

  async getProductSkuLicense(productId: string, skuId: string) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const sku = product.skuDetails.find((sku) => sku._id.toString() === skuId)

      if (!sku) {

        throw new Error('Sku does not exist')

      }

      const result = await this.productModel.getAllLicenses({ product: productId, productSku: skuId })

      return {
        success: true,
        message: 'License fetched successfully',
        result: result
      }

    } catch (error) {

      throw error

    }

  }

  async updateProductSkuLicense(productId: string, skuId: string, licenseKeyId: string, licenseKey: string) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const sku = product.skuDetails.find((sku) => sku._id.toString() === skuId)

      if (!sku) {

        throw new Error('Sku does not exist')

      }

      const result = await this.productModel.updateProductSkuLicense({ _id: licenseKeyId }, { licenseKey: licenseKey })

      return {
        success: true,
        message: 'License updated successfully',
        result: result
      }

    } catch (error) {

      throw error

    }

  }

  async removeProductSkuLicense(licenseKeyId: string) {

    try {

      const result = await this.productModel.removeLicens({ _id: licenseKeyId })

      if (!result) {

        throw new Error('License does not exist')

      }

      return {
        success: true,
        message: 'License removed successfully',
        result: null
      }

    } catch (error) {

      throw error

    }

  }

  async addProductReview(productId: string, review: string, rating: number, user: Record<string, any>) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      if (product.feedbackDetails.find((value: { customerId: string }) => value.customerId === user._id.toString())) {

        throw new BadRequestException('You  have already gave the review  for this product')

      }

      const order = await this.orderModel.findOneOrder({ userId: user._id, 'orderedItems.product': productId })

      if (!order) {

        throw new BadRequestException('You have not purchased this product')

      }

      const ratings: any[] = []

      product.feedbackDetails.forEach((comment: { rating: any }) => ratings.push(comment.rating))

      let avgRating = String(rating)

      if (ratings.length > 0) {

        avgRating = (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(2)

      }

      const reviewDetails = {
        feedbackMsg: review,
        rating: rating,
        customerId: user._id,
        customerName: user.name
      }

      const result = await this.productModel.findOneAndUpdate(
        { _id: productId },
        {
          $set: { avgRating },
          $push: { feedbackDetails: reviewDetails }
        }
      )

      return {
        success: true,
        message: 'Review added successfully',
        result
      }

    } catch (error) {

      throw error

    }

  }

  async removeProductReview(productId: string, reviewId: string) {

    try {

      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {

        throw new Error('Product does not exist')

      }

      const review = product.feedbackDetails.find((r) => r._id.toString() === reviewId)

      if (!review) {

        throw new BadRequestException('Review does not exist')

      }

      const ratings: any[] = []

      product.feedbackDetails.forEach((comment) => {

        if (comment._id.toString() !== reviewId) {

          ratings.push(comment.rating)

        }

      }

      )

      let avgRating = '0'

      if (ratings.length > 0) {

        avgRating = (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(2)

      }

      const result = await this.productModel.findOneAndUpdate(
        { _id: productId },
        {
          $set: { avgRating },
          $pull: { feedbackDetails: { _id: reviewId } }
        }
      )

      return {
        success: true,
        message: 'Review removed successfully',
        result
      }

    } catch (error) {

      throw error

    }

  }

}
