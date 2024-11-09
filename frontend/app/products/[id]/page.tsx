'use client'

import { getFormatedStringFromDays } from '../../../utils'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Nav, Row, Tab, Table } from 'react-bootstrap'
import StarRatingComponent from 'react-star-rating-component'
import { useToasts } from 'react-toast-notifications'
import NumericInput from 'react-numeric-input'
import { BagCheckFill } from 'react-bootstrap-icons'
import { Context } from '../../../context'
import ProductItem from '../../../components/Products/ProductItem'
import SkuDetailsList from '../../../components/Products/SkuDetailsList'
import CartOffCanvas from '@/components/CartOffCanvas'

interface Product {
    _id: string,
    productName: string,
    description: string,
    image: string
    category: string,
    platformType: string,
    baseType: string,
    avgRating: number
    productUrl: string,
    downloadUrl: string,
    feedbackDetails: any[],
    requirementSpecification: any[],
    skuDetails: any[],
    hightlights: any[]
}

interface ProductDetailsResponse {
    product: Product;
    relatedProducts: Record<string, any>;
}

const ProductDetails = () => {

    const router = useRouter()

    const { addToast } = useToasts()

    const params = useParams()

    const productId = params.id

    const [productDetails, setProductDetails] = useState<ProductDetailsResponse | null>(null)

    const [displaySku, setDisplaySku] = useState<Record<string, any> | null>(null)

    const [allSkuDetails, setAllSkuDetails] = useState(productDetails?.product.skuDetails || [])

    const [show, setShow] = useState(false)


    const { cartItems, cartDispatch, state: { user } } = useContext(Context)

    useEffect(() => {

        if (productDetails?.product?.skuDetails) {

            const sortedSkuDetails = productDetails.product.skuDetails.sort(
                (a: { price: number }, b: { price: number }) => a.price - b.price
            )

            setDisplaySku(sortedSkuDetails[0] || {})

        }

    }, [productDetails])

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                if (productId) {

                    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/products/${productId}`)

                    setProductDetails({ product: data?.result?.product, relatedProducts: data?.result.relatedProducts })

                }

            } catch (error: any) {

                addToast(error.response?.data?.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }
        }

        fetchProduct()

    }, [productId, addToast])

    const [quantity, setQuantity] = useState(1)

    const handleCart = () => {

        cartDispatch({
            type: cartItems.find((item: { skuId: string }) => item.skuId === displaySku?._id)
                ?
                'UPDATE_CART'
                :
                'ADD_TO_CART',
            payload: {
                skuId: displaySku?._id,
                quantity: quantity,
                price: displaySku?.price,
                validity: displaySku?.lifetime ? 0 : displaySku?.validity,
                lifetime: displaySku?.lifetime,
                productName: productDetails?.product.productName,
                productImage: productDetails?.product.image,
                productId: productDetails?.product._id,
                skuPriceId: displaySku?.stripePriceId
            }
        })

        setShow(true)

    }


    return (

        <>

            <Row className='firstRow'>

                <Col sm={4}>

                    <Card className='productImgCard'>

                        <Card.Img
                            variant='top'
                            src={productDetails?.product?.image}
                        />

                    </Card>

                </Col>

                <Col sm={8}>

                    <h2>{productDetails?.product?.productName}</h2>

                    <div className="divStar">

                        <StarRatingComponent
                            name='rate2'
                            editing={false}
                            starCount={5}
                            value={productDetails?.product?.avgRating || 0}
                        />

                        ({productDetails?.product?.feedbackDetails?.length || 0} reviews)

                    </div>

                    <p className='productPrice'>₹{displaySku?.price || '000'} {' '}

                        <Badge bg='warning' text='dark'>

                            {displaySku?.lifetime ? 'Lifetime' : getFormatedStringFromDays(displaySku?.validity | 0)}

                        </Badge>

                    </p>

                    <ul>

                        {productDetails?.product.hightlights && productDetails.product.hightlights.length > 0 &&
                            productDetails?.product.hightlights.map((hightlight: string, key: any) => (

                                <li key={key}>{hightlight}</li>

                            ))
                        }

                    </ul>

                    <div>

                        {' '}

                        {productDetails?.product.skuDetails && productDetails?.product.skuDetails.length > 0 && productDetails.product.skuDetails.sort((a: { validity: number }, b: { validity: number }) => a.validity - b.validity).map((sku: Record<string, any>, key: any) => (

                            <Badge
                                bg='info'
                                text='dark'
                                className='skuBtn'
                                key={key}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setDisplaySku(sku)}
                            >

                                {sku.lifetime ? 'Lifetime' : getFormatedStringFromDays(sku.validity)}
                            </Badge>

                        ))}

                    </div>

                    <div className='productSkuZone'>

                        <NumericInput
                            min={1}
                            max={5}
                            value={quantity}
                            size={5}
                            onChange={(value: any) => setQuantity(Number(value))}
                            disabled={!displaySku?.price}
                        />

                        <Button
                            variant='primary'
                            onClick={handleCart}
                            disabled={!displaySku?.price}
                            className='cartBtn'
                        >

                            <BagCheckFill className='cartIcon' />

                            {cartItems.find((item: any) => displaySku && item.skuId === displaySku._id) ? 'Update cart' : 'Add cart'}
                        </Button>


                    </div>

                </Col>

            </Row>

            <br />

            <hr />
            <Row>

                <Tab.Container id='left-tabs-example' defaultActiveKey='first'>

                    <Row>

                        <Col sm={3}>

                            <Nav variant='pills' className='flex-column'>

                                <Nav.Item>
                                    <Nav.Link eventKey='first' href={'#'}>
                                        Description
                                    </Nav.Link>
                                </Nav.Item>

                                {productDetails?.product.requirementSpecification && productDetails.product.requirementSpecification.length > 0 && (

                                    <Nav.Item>

                                        <Nav.Link eventKey='second' href='#'>
                                            Requirements
                                        </Nav.Link>

                                    </Nav.Item>

                                )}

                                <Nav.Item>

                                    <Nav.Link eventKey='third' href='#'>
                                        Reviews
                                    </Nav.Link>

                                </Nav.Item>

                                {user?.type === 'admin' && (

                                    <Nav.Item>

                                        <Nav.Link eventKey='fourth' href='#'>
                                            Product SKUs
                                        </Nav.Link>

                                    </Nav.Item>

                                )}

                            </Nav>

                        </Col>

                        <Col sm={9}>

                            <Tab.Content>

                                <Tab.Pane eventKey='first'>

                                    {productDetails?.product.description} <br />

                                    <a
                                        href={productDetails?.product.productUrl}
                                        target='_blank'
                                        rel='noreferrer'
                                        style={{ textDecoration: 'none', float: "right" }}
                                    >

                                        Get more info...

                                    </a>

                                    <br />

                                    <br />

                                    <a
                                        href={productDetails?.product.downloadUrl}
                                        className='btn btn-primary text-center'
                                        target='_blank'
                                        rel='noreferrer'
                                        style={{ textDecoration: 'none', float: 'right' }}
                                    >

                                        Download this

                                    </a>

                                </Tab.Pane>

                                <Tab.Pane eventKey='second'>

                                    <Table responsive>

                                        <tbody>

                                            {productDetails?.product.requirementSpecification && productDetails.product.requirementSpecification.length > 0 && productDetails.product.requirementSpecification.map((requirement: string, key: any) => (

                                                <tr key={key}>
                                                    <td width='30%'>
                                                        {Object.keys(requirement)[0]} {' '}
                                                    </td>

                                                    <td width='70%'>
                                                        {Object.values(requirement)[0]}
                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </Table>

                                </Tab.Pane>

                                <Tab.Pane eventKey='third'>

                                    {/* <ReviewSection
                                        reviews={productDetails?.product.feedbackDetails || []}
                                        productId={productDetails?.product._id}
                                    /> */}

                                </Tab.Pane>

                                <Tab.Pane eventKey='fourth'>

                                    <SkuDetailsList
                                        skuDetails={productDetails?.product.skuDetails || []}
                                        productId={productDetails?.product._id}
                                        setAllSkuDetails={setAllSkuDetails}

                                    />

                                </Tab.Pane>

                            </Tab.Content>

                        </Col>

                    </Row>

                </Tab.Container>

            </Row>

            <br />

            <Row xs={1} md={4} className='g-3'>

                {Array.isArray(productDetails?.relatedProducts.products) && productDetails?.relatedProducts.products.map((relatedProduct: Product) => (

                    <Col key={relatedProduct._id}>

                        <ProductItem product={relatedProduct} userType={'customer'} />

                    </Col>

                ))}

            </Row>

            <CartOffCanvas
                setShow={setShow}
                show={show}
            />

        </>

    )

}

export default ProductDetails