import { Product } from '@/services/product.service'
import { getFormatedStringFromDays } from '@/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FC, useState } from 'react'
import { Badge, Button, Card, Col } from 'react-bootstrap'
import { Eye, Pen, Pencil, Trash, Upload } from 'react-bootstrap-icons'
import StarRatingComponent from 'react-star-rating-component'
import { useToasts } from 'react-toast-notifications'

interface Props {
    product: Record<string, any>
    userType: string
}

const ProductItem: FC<Props> = ({ product, userType }) => {

    const [isLoading, setIsLoading] = useState(false)

    const [uploading, setUploading] = useState(false)

    const { addToast } = useToasts()

    const router = useRouter()

    const handleDelProduct = async () => {

        try {

            setIsLoading(true)

            const deleteConfirm = confirm('Want to delete? You will lost all details, skus and licenses for this product')

            if (deleteConfirm) {

                const res = await Product.deleteProduct(product._id)

                if (!res.success) {

                    throw new Error(res.message)

                }

                addToast(res.message, { appearance: 'success', autoDismiss: true })

                router.push('/products')

            }

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        } finally {

            setIsLoading(false)

        }

    }

    const handleUploadImgProd = async (e: any) => {

        e.preventDefault()

        try {

            setUploading(true)

            const file = e.target.files[0]

            const formData = new FormData()

            formData.append('productImage', file)

            const res = await Product.uploadProdImage(product._id, formData)

            if (!res.success) {

                throw new Error(res.message)

            }

            product.image = res.result

            addToast(res.message, { appearance: 'success', autoDismiss: true })

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        } finally {

            setUploading(false)

        }

    }

    return (

        <Col>

            <Card className='productCard'>

                <Card.Body>

                    <Card.Img
                        variant="top"
                        src={uploading
                            ? 'https://www.ebi.ac.uk/training/progressbar.gif'
                            : product?.image
                        }
                    />

                    <Card.Title>{product.productName}</Card.Title>

                    <StarRatingComponent name='ratel' starCount={5} value={product.avgRating || 0} />

                    <Card.Text>

                        <span className='priceText'>

                            {product.skuDetails

                                ? product.skuDetails.length > 1

                                    ? `₹${Math.min.apply(Math, product.skuDetails.map((o: any) => o.price))} - ₹${Math.max.apply(Math, product.skuDetails.map((o: any) => o.price))}`

                                    : `₹${product.skuDetails[0]?.price || '000'} `

                                : '₹0'

                            }

                        </span>

                    </Card.Text>

                    {
                        product.skuDetails
                        &&
                        product.skuDetails.length > 0
                        &&
                        product.skuDetails.sort((a: { validity: number }, b: { validity: number }) =>

                            a.validity - b.validity

                        ).map((sku: any, i: React.Key) => (

                            <Badge
                                key={i}
                                bg='warning'
                                text='dark'
                                className='skuBtn'
                            >

                                {sku.lifetime ? 'Lifetime' : getFormatedStringFromDays(sku.validity)}

                            </Badge>

                        ))
                    }

                    <br />

                    {userType === 'admin'
                        ?
                        (
                            <div className='btnGrpForProduct'>

                                <div className='file btn btn-md btn-outline-primary fileInputDiv'>

                                    <Upload />

                                    <input
                                        type="file"
                                        name='file'
                                        className='fileInput'
                                        onChange={handleUploadImgProd}
                                    />

                                </div>

                                <Link
                                    className='btn btn-outline-dark viewProdBtn'
                                    href={`/products/update-product?productId=${product?._id}`}
                                >

                                    <Pencil />

                                </Link>

                                <Button
                                    variant='outline-dark'
                                    className='btn btn-outline-dark viewProdBtn'
                                    onClick={() => handleDelProduct()}
                                >

                                    {isLoading && (

                                        <span className='spinner-border spinner-border-sm mr-2' role='status' aria-hidden='true'></span>

                                    )}

                                    <Trash />

                                </Button>

                                <Link className='btn btn-outline-dark viewProdBtn' href={`/products/${product?._id}`}>

                                    <Eye />

                                </Link>

                            </div>
                        )
                        :
                        (
                            <Link href={`/products/${product?._id}`} className='btn btn-outline-dark viewProdBtn'>
                                <Eye /> View Details
                            </Link>

                        )
                    }


                </Card.Body>

            </Card>

        </Col>

    )

}

export default ProductItem