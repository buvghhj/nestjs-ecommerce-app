import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query, UseInterceptors, UploadedFile, Put, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../decorators/role.decorator';
import { User, UserType } from '../schemas/user.schema';
import { GetProductQueryDto } from './dto/get-product-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import config from 'config';
import { ProductSkuDto, ProductSkuDtoArr } from './dto/product-sku.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @HttpCode(201)
  @Roles(UserType.ADMIN)
  async createProduct(@Body() createProductDto: CreateProductDto) {

    return await this.productsService.createProduct(createProductDto)

  }

  @Patch('/:id')
  @Roles(UserType.ADMIN)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {

    return await this.productsService.updateProduct(id, updateProductDto)

  }

  @Get()
  async findAllProduct(@Query() query: GetProductQueryDto) {

    return await this.productsService.findAllProducts(query)

  }

  @Get('/:id')
  async findOneProduct(@Param('id') id: string) {

    return await this.productsService.findOneProduct(id)

  }


  @Delete('/:id')
  @Roles(UserType.ADMIN)
  async deleteProduct(@Param('id') id: string) {

    return this.productsService.removeProduct(id)

  }

  @Post('/:id/image')
  @Roles(UserType.ADMIN)
  @UseInterceptors(
    FileInterceptor(
      'productImage',
      {
        dest: config.get('fileStoragePath'),
        limits: {
          fileSize: 3145728, //3MB
        }
      }
    ))
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: ParameterDecorator
  ) {

    return await this.productsService.uploadProductImage(id, file)

  }

  @Post('/:productId/skus')
  @Roles(UserType.ADMIN)
  async createProductSku(
    @Param('productId') productId: string,
    @Body() updateProductSkuDto: ProductSkuDtoArr
  ) {

    return await this.productsService.createProductSku(productId, updateProductSkuDto)

  }

  @Put('/:productId/sku/:skuId')
  @Roles(UserType.ADMIN)
  async updateProductSkuById(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body() updateProductSkuDto: ProductSkuDto
  ) {

    return await this.productsService.updateProductSkuById(productId, skuId, updateProductSkuDto)

  }

  @Delete('/:productId/sku/:skuId')
  @Roles(UserType.ADMIN)
  async removeProductSkuById(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string
  ) {

    return await this.productsService.removeProductSkuById(productId, skuId)

  }

  @Post('/:productId/sku/:skuId/licenses')
  @Roles(UserType.ADMIN)
  async addProductSkuLicense(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body('licenseKey') licenseKey: string
  ) {

    return await this.productsService.addProductSkuLicense(productId, skuId, licenseKey)

  }

  @Get('/:productId/sku/:skuId/licenses')
  @Roles(UserType.ADMIN)
  async getProductSkuLicense(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string
  ) {

    return await this.productsService.getProductSkuLicense(productId, skuId)

  }

  @Put('/:productId/sku/:skuId/licenses/:licenseKeyId')
  @Roles(UserType.ADMIN)
  async updateProductSkuLicense(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Param('licenseKeyId') licenseKeyId: string,
    @Body('licenseKey') licenseKey: string
  ) {

    return await this.productsService.updateProductSkuLicense(productId, skuId, licenseKeyId, licenseKey)

  }

  @Delete('/licenses/:licenseKeyId')
  @Roles(UserType.ADMIN)
  async removeProductSkuLicense(
    @Param('licenseKeyId') licenseKeyId: string
  ) {

    return await this.productsService.removeProductSkuLicense(licenseKeyId)

  }

  @Post('/:productId/reviews')
  @Roles(UserType.CUSTOMER)
  async addProductReview(
    @Param('productId') productId: string,
    @Body('review') body: string,
    @Body('rating') rating: number,
    @Req() req: any
  ) {

    return await this.productsService.addProductReview(productId, body, rating, req.user)

  }

  @Delete('/:productId/review/:reviewId')
  async removeProductReview(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {

    return await this.productsService.removeProductReview(productId, reviewId)

  }

}
