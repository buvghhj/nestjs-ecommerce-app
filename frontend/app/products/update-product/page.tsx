'use client'

import { Product } from '../../../services/product.service'
import axios from 'axios'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, InputGroup, ListGroup, Row, Table } from 'react-bootstrap'
import { Check2Circle, Pencil, PenFill, Trash } from 'react-bootstrap-icons'
import { useToasts } from 'react-toast-notifications'

const initialForm = {
    productName: '' as string,
    description: '' as string,
    category: '' as string,
    platformType: '' as string,
    baseType: '' as string,
    productUrl: '' as string,
    downloadUrl: '' as string,
    requirementSpecification: [] as Record<string, any>[],
    hightlights: [] as string[]
}

interface ProductProps {
    productIdForUpdate: string
}

const UpdateProduct = () => {

    const searchParams = useSearchParams()

    const productIdForUpdate = searchParams.get('productId')

    const router = useRouter()

    const { addToast } = useToasts()

    const [productForm, setProductForm] = useState(initialForm)

    const [requirementName, setRequirementName] = useState('')

    const [requirementDesc, setRequirementDesc] = useState('')

    const [updateRequirementIndex, setUpdateRequirementIndex] = useState(-1)

    const [hightlight, setHightlight] = useState('')

    const [updateHightlightIndex, setUpdateHightlightIndex] = useState(-1)

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/products/${productIdForUpdate}`)

                if (data?.result?.product) {

                    setProductForm({ ...initialForm, ...data.result.product })

                }

            } catch (error: any) {

                addToast(error.response?.data?.message || 'Lỗi khi lấy dữ liệu sản phẩm', { appearance: 'error', autoDismiss: true })

            }

        }

        if (productIdForUpdate) {

            fetchProduct()

        }

    }, [productIdForUpdate, addToast])

    const handleRequirementAdd = () => {

        if (updateRequirementIndex !== -1) {

            setProductForm({

                ...productForm,

                requirementSpecification: productForm.requirementSpecification.map((value, index) => {

                    if (index === updateRequirementIndex) {

                        return { [requirementName]: requirementDesc }

                    }

                    return value

                }

                )

            })

        } else {

            setProductForm({

                ...productForm,

                requirementSpecification: [

                    ...productForm.requirementSpecification,

                    {
                        [requirementName]: requirementDesc
                    }

                ]

            })

        }

        setRequirementName('')
        setRequirementDesc('')
        setUpdateRequirementIndex(-1)

    }

    const handleHightlightAdd = () => {

        if (updateHightlightIndex !== -1) {

            setProductForm({

                ...productForm,

                hightlights: productForm.hightlights.map((value, index) => {

                    if (index === updateHightlightIndex) {

                        return hightlight

                    }

                    return value

                }

                )

            })

        } else {

            setProductForm({

                ...productForm,

                hightlights: [

                    ...productForm.hightlights,

                    hightlight

                ]

            })

        }

        setHightlight('')
        setUpdateHightlightIndex(-1)

    }

    const handleSubmitForm = async (e: any) => {

        e.preventDefault()

        try {

            setIsLoading(true)

            if (productIdForUpdate) {

                await Product.updateProduct(productIdForUpdate, productForm)

                router.push('/products')

                addToast('Product Updated Successfully', { appearance: 'success', autoDismiss: true })

            } else {

                await Product.createProduct(productForm)

                router.push('/products')

                addToast('Product Created Successfully', { appearance: 'success', autoDismiss: true })

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

    return (

        <>

            <Card
                className='updateProductCard'
                style={{ padding: '15px', marginTop: '20px' }}
            >

                <Row>

                    <h4 className='text-center productFormHeading' >
                        Product Details Form
                    </h4>

                    <hr />

                    <Col>

                        <Form>


                            <Form.Group controlId='productName'>

                                <Form.Label>Product Name</Form.Label>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter Product Name'
                                    value={productForm.productName}
                                    onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                                >

                                </Form.Control>

                            </Form.Group>

                            <Form.Group controlId='description'>

                                <Form.Label>Description</Form.Label>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter Description'
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                />

                            </Form.Group>

                            <Form.Group controlId='requirements'>

                                <Form.Label>Product Requirements</Form.Label>
                                <InputGroup className='mb-3'>

                                    <Form.Control
                                        as='textarea'
                                        rows={2}
                                        placeholder='Enter Product Requirements'
                                        value={requirementName}
                                        onChange={(e) => { setRequirementName(e.target.value) }}
                                    />

                                    <Form.Control
                                        as='textarea'
                                        rows={2}
                                        placeholder='Enter Product Description'
                                        value={requirementDesc}
                                        onChange={(e) => { setRequirementDesc(e.target.value) }}
                                    />

                                    <Button variant='outline-secondary' onClick={handleRequirementAdd}>
                                        <Check2Circle />
                                    </Button>

                                </InputGroup>

                            </Form.Group>

                            <div>

                                <p style={{ color: '#10557a' }}>Requirement are listed here:</p>

                                <Table striped bordered hover>

                                    <thead>

                                        <tr>

                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Action</th>


                                        </tr>

                                    </thead>

                                    <tbody>

                                        {productForm.requirementSpecification.map((item, index) => {

                                            return (

                                                <tr key={index}>

                                                    <td>{Object.keys(item)[0]}</td>
                                                    <td>{Object.values(item)[0]}</td>
                                                    <td>

                                                        <Button
                                                            variant='secondary'
                                                            style={{ marginRight: '4px' }}
                                                            size='sm'
                                                            onClick={() => {

                                                                setUpdateRequirementIndex(index)
                                                                setRequirementName(Object.keys(item)[0])
                                                                setRequirementDesc(Object.values(item)[0])

                                                            }}
                                                        >

                                                            <PenFill />

                                                        </Button>

                                                        <Button
                                                            variant='danger'
                                                            size='sm'
                                                            onClick={() => {

                                                                const newRequirementSpecification = productForm.requirementSpecification.filter((item, i) => i !== index)

                                                                setProductForm({
                                                                    ...productForm,
                                                                    requirementSpecification: newRequirementSpecification
                                                                })

                                                            }}
                                                        >

                                                            <Trash />

                                                        </Button>

                                                    </td>

                                                </tr>

                                            )

                                        })}

                                    </tbody>

                                </Table>

                            </div>

                        </Form>

                    </Col>

                    <Col>

                        <Form>

                            <Form.Group controlId='category'>

                                <Form.Label >Product Category</Form.Label>

                                <Form.Select
                                    aria-label='Select Category'
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                >

                                    <option value="">Choose the category</option>
                                    <option value="Operating System">Operating System</option>
                                    <option value="Application Software">Application Software</option>

                                </Form.Select>

                            </Form.Group>

                            <Form.Group controlId='platformType'>

                                <Form.Label >Platform Type</Form.Label>

                                <Form.Select
                                    aria-label='Select Platform Type'
                                    value={productForm.platformType}
                                    onChange={(e) => setProductForm({ ...productForm, platformType: e.target.value })}
                                >

                                    <option value="">Choose the platform type</option>
                                    <option value="Windows">Windows</option>
                                    <option value="Mac">Mac</option>
                                    <option value="Linux">Linux</option>
                                    <option value="Android">Android</option>
                                    <option value="iOS">iOS</option>

                                </Form.Select>

                            </Form.Group>

                            <Form.Group controlId='platformType'>

                                <Form.Label >Base Type</Form.Label>

                                <Form.Select
                                    aria-label='Select Base Type'
                                    value={productForm.baseType}
                                    onChange={(e) => setProductForm({ ...productForm, baseType: e.target.value })}
                                >

                                    <option value="">Choose the base type</option>
                                    <option value="Computer">Computer</option>
                                    <option value="Mobile">Mobile</option>

                                </Form.Select>

                            </Form.Group>

                            <Form.Group controlId='productUrl'>

                                <Form.Label >Product  Url</Form.Label>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter Product  Url'
                                    value={productForm.productUrl}
                                    onChange={(e) => setProductForm({ ...productForm, productUrl: e.target.value })}
                                />

                            </Form.Group>


                            <Form.Group controlId='productUrl'>

                                <Form.Label >Product Download Url</Form.Label>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter Product Download Url'
                                    value={productForm.downloadUrl}
                                    onChange={(e) => setProductForm({ ...productForm, downloadUrl: e.target.value })}
                                />

                            </Form.Group>

                            <Form.Group controlId='hightlights'>

                                <Form.Label>Product Hightlights</Form.Label>

                                <InputGroup className='mb-3'>

                                    <Form.Control
                                        type='text'
                                        placeholder='Enter Product Hightlights'
                                        value={hightlight}
                                        onChange={(e) => {

                                            setHightlight(e.target.value)

                                        }}
                                    />

                                    <Button variant='secondary' onClick={handleHightlightAdd}>

                                        <Check2Circle />

                                    </Button>

                                </InputGroup>

                            </Form.Group>

                            <p style={{ color: '#10557a' }}>Product hightlight are listed below:</p>

                            <ListGroup>

                                {productForm.hightlights.map((hightlight, index) => (

                                    <ListGroup.Item key={index}>

                                        {hightlight}

                                        <Button variant='outlined-secondary' style={{ float: 'right' }} onClick={() => {

                                            setHightlight(hightlight)
                                            setUpdateHightlightIndex(index)

                                        }}>

                                            <Pencil />

                                        </Button>
                                        {' '}
                                        <Button variant='outlined-danger' style={{ float: 'right' }} onClick={() => {

                                            const hightlights = productForm.hightlights

                                            hightlights.splice(index, 1)

                                            setProductForm({

                                                ...productForm,
                                                hightlights: hightlights

                                            })

                                        }}>

                                            <Trash />

                                        </Button>

                                    </ListGroup.Item>

                                ))}

                                {productForm.hightlights.length === 0 && <ListGroup.Item>No hightlights added</ListGroup.Item>}

                            </ListGroup>

                        </Form>
                    </Col>

                </Row>

                <br />

                <Row>

                    <Col></Col>
                    <Col style={{ textAlign: 'end' }}>

                        <Link href={'/products'}>

                            <Button variant='secondary' >Back</Button>

                        </Link>{' '}

                        <Button
                            variant='info'
                            onClick={(e) => setProductForm(initialForm)}
                        >
                            Cancel
                        </Button>
                        {' '}

                        <Button
                            variant='primary'
                            type='submit'
                            onClick={handleSubmitForm}
                            disabled={isLoading}>

                            {isLoading && (

                                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>

                            )}

                            Submit

                        </Button>

                    </Col>

                </Row>

            </Card >

        </>

    )

}

export default UpdateProduct