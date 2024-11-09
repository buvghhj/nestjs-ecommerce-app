import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CheckoutDtoArr } from './dto/checkout.dto';
import { ProductRepository } from '../repositories/product.repository';
import { UserRepository } from '../repositories/user.repository';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import config from 'config';
import { UserType } from 'src/schemas/user.schema';
import { orderStatus, paymentStatus } from '../schemas/order.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {

  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @Inject(OrderRepository) private readonly orderModel: OrderRepository,
    @Inject(ProductRepository) private readonly productModel: ProductRepository,
    @Inject(UserRepository) private readonly userModel: UserRepository,
    private readonly userService: UsersService

  ) { }

  async create(createOrderDto: Record<string, any>) {

    try {

      const orderExists = await this.orderModel.findOneOrder({ checkoutSessionId: createOrderDto.checkoutSessionId })

      if (orderExists) return orderExists

      const result = await this.orderModel.createOrder(createOrderDto)

      return result

    } catch (error) {

      throw error

    }

  }

  async findAll(status: string, user: Record<string, any>) {

    try {

      const userDetails = await this.userModel.findOne({ _id: user.id.toString() })

      const query = {} as Record<string, any>

      if (userDetails.type === UserType.CUSTOMER) {

        query.userId = user._id.toString()

      }

      if (status) {

        query.status = status

      }

      const orders = await this.orderModel.findOrders(query)

      return {
        success: true,
        message: 'Orders fetched successfully',
        result: orders
      }

    } catch (error) {

      throw error

    }

  }

  async findOne(id: string) {

    try {

      const result = await this.orderModel.findOneOrder({ _id: id })

      return {
        success: true,
        message: 'Order fetched successfully',
        result: result
      }

    } catch (error) {

      throw error

    }

  }

  async checkout(body: CheckoutDtoArr, user: Record<string, any>) {

    try {

      const lineItems = []

      const cartItems = body.checkoutDetails

      for (const item of cartItems) {

        const itemsAreInstock = await this.productModel.getAllLicenses({ productSku: item.skuId, isSold: false })

        if (itemsAreInstock.length < item.quantity) {

          lineItems.push({

            price: item.skuPriceId,

            quantity: item.quantity,

            adjustable_quantity: { enabled: true, maximum: 5, minimum: 1 }

          })

        }

      }

      if (lineItems.length === 0) {

        throw new BadRequestException('These product are not available right now')

      }

      const session = await this.stripeClient.checkout.sessions.create({

        line_items: lineItems,

        metadata: {
          userId: user._id.toString()
        },

        mode: 'payment',
        billing_address_collection: 'required',
        phone_number_collection: { enabled: true },
        customer_email: user.email,
        cancel_url: config.get('stripe.cancelUrl'),
        success_url: config.get('stripe.successUrl')

      })

      return {
        success: true,
        message: 'Checkout session created successfully',
        result: session.url
      }

    } catch (error) {

      throw error

    }

  }

  async webhook(rawBody: Buffer, sig: string) {

    try {

      let event

      try {

        event = this.stripeClient.webhooks.constructEvent(rawBody, sig, config.get('stripe.webhookSecret'),)

      } catch (error) {

        throw new Error(`Webhook Error: ${error.message}`)

      }

      console.log('adfasdfsdf', event.type);

      if (event.type === 'checkout.session.completed') {

        const session = event.data.object as Stripe.Checkout.Session

        const orderData = await this.createOrderObject(session)

        const order = await this.create(orderData)

        if (session.payment_status === paymentStatus.paid) {

          if (order.orderStatus !== orderStatus.completed) {

            for (const item of order.orderedItems) {

              const licenses = await this.getLicense(orderData.orderId, item)

              item.licenses = licenses

            }

          }

          await this.fullfillOrder(session.id, { orderStatus: orderStatus.completed, isOrderDeliverd: true, ...orderData })

          this.sendOrderEmail(

            orderData.customerEmail,

            orderData.orderId,

            `${config.get('emailService.emailTemplates.orderSuccess')}${order._id}`

          )

        }

      } else {

        console.log(`Unhandled event type ${event.type}`)

      }

    } catch (error) {

      console.error('Webhook processing error:', error.message)

      throw error

    }

  }

  async fullfillOrder(checkoutSessionId: string, updateOrderDto: Record<string, any>) {

    try {

      return await this.orderModel.findOneAndUpdate({ checkoutSessionId }, updateOrderDto, { new: true })

    } catch (error) {

      throw error

    }

  }

  async sendOrderEmail(email: string, orderId: string, orderLink: string) {

    await this.userService.sendEmail(
      email,
      config.get('emailService.emailTemplates.orderSuccess'),
      'Order Success',
      {
        orderId,
        orderLink
      }
    )

  }

  async getLicense(orderId: string, item: Record<string, any>) {

    try {

      if (!item.product) {

        throw new Error('Missing productId in OrderedItem')

      }

      const product = await this.productModel.findOne({ _id: item.product })

      if (!product) {

        throw new Error(`Product not found for productId: ${item.product}`)

      }

      const skuDetails = product.skuDetails.find((sku) => sku.skuCode === item.skuCode)

      if (!skuDetails) {

        throw new Error(`SKU details not found for skuCode: ${item.skuCode}`)

      }

      const licenses = await this.productModel.getAllLicenses({ productSku: skuDetails._id, isSold: false }, item.quantity)

      // if (licenses.length < item.quantity) {

      //   throw new Error(`Not enough licenses available for skuCode: ${item.skuCode}`)

      // }

      const licenseIds = licenses.map((license) => license._id)

      await this.productModel.updateLicenseMany({ _id: { $in: licenseIds } }, { isSold: true, orderId })

      return licenses.map((license) => license.licenseKey)

    } catch (error) {

      console.error('Error in getLicense:', error.message)

      throw error

    }

  }

  async createOrderObject(session: Stripe.Checkout.Session) {

    try {

      const lineItems = await this.stripeClient.checkout.sessions.listLineItems(session.id)

      const orderData = {

        orderId: Math.floor(new Date().valueOf() * Math.random()) + '',

        userId: session.metadata?.userId?.toString(),

        customerAddress: session.customer_details?.address,

        customerEmail: session.customer_email,

        customerPhoneNumber: session.customer_details?.phone,

        paymentInfor: {
          paymentMethod: session.payment_method_types[0],
          paymentIntentId: session.payment_intent,
          paymentDate: new Date(),
          paymentFailureReason: '',
          paymentAmount: session.amount_total / 100,
          paymentStatus: session.payment_status
        },

        orderDate: new Date(),

        checkoutSessionId: session.id,

        orderedItems: lineItems.data.map((item) => {

          item.price.metadata.quantity = item.quantity + ''

          return item.price.metadata

        })

      }

      return orderData

    } catch (error) {

      throw error

    }

  }

}
