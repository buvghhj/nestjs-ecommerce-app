'use client'

import BreadcrumDisplay from '@/components/shared/BreadcrumDisplay'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Col, Dropdown, DropdownButton, Row } from 'react-bootstrap'
import styles from '../../styles/Home.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductFilter from '@/components/Products/ProductFilter'
import ProductItem from '@/components/Products/ProductItem'
import PaginationDisplay from '@/components/shared/PaginationDisplay'
import Link from 'next/link'
import { Context } from '@/context'
import { PlusCircle } from 'react-bootstrap-icons'

const AllProducts = () => {

    const router = useRouter()

    const searchParams = useSearchParams()

    const [products, setProducts] = useState<{ products: any[]; metadata: any | null }>({ products: [], metadata: null })

    const [sortText, setSortText] = useState("Sort By")

    const [userType, setUserType] = useState("customer")

    const { state: { user } } = useContext(Context)

    useEffect(() => {

        if (user) {

            setUserType(user?.type)

        }

    }, [user])

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const { data } = await axios.get(`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL : process.env.NEXT_PUBLIC_BASE_API_URL}/products`)

                setProducts({ products: data?.result?.products, metadata: data?.result?.metadata })

            } catch (error) {

                console.error("Error fetching products:", error)

            }

        }

        fetchProducts()

    }, [])

    const handleSortChange = (sort: string) => {

        const params = new URLSearchParams(searchParams.toString())

        if (sort) {

            params.set('sort', sort)

        } else {

            params.delete('sort')

        }

        router.push(`?${params.toString()}`)

    }

    console.log('qqqqqqqq', products);

    return (

        <>

            <Row>

                <Col md={8}>

                    <BreadcrumDisplay childrens={[{ active: false, href: '/', text: 'Home' }, { active: true, href: '', text: 'Products' }]} />

                </Col>

                <Col md={4}>

                    <DropdownButton
                        variant="outline-secondary"
                        id="input-group-dropdown-2"
                        title={sortText}
                        className={styles.dropdownBtn}
                        onSelect={(e) => {
                            if (e) {

                                setSortText(e === '-avgRating' ? "Rating" : e === '-createdAt' ? 'Latest' : 'Sort By')

                                handleSortChange(e)

                            } else {

                                setSortText("Sort By")

                                handleSortChange('')

                            }

                        }}
                    >
                        <Dropdown.Item eventKey='-createdAt'>Latest</Dropdown.Item>
                        <Dropdown.Item eventKey='-avgRating'>Rating</Dropdown.Item>
                        <Dropdown.Item eventKey=''>Reset</Dropdown.Item>
                    </DropdownButton>

                    {userType === 'admin' && (

                        <Link href={'/products/update-product'} className='btn btn-primary btnAddProduct'>

                            <PlusCircle className='btnAddProductIcon' />
                            Add Product

                        </Link>

                    )}

                </Col>

            </Row >

            <Row>

                <Col sm={2}><ProductFilter /></Col>

                <Col sm={10}>

                    <Row xs={1} md={3} className='g-3'>

                        {Array.isArray(products.products) && products.products.length > 0
                            ?
                            (products.products.map((product) => (

                                <ProductItem key={product._id} product={product} userType={userType} />

                            ))
                            )
                            :
                            (
                                <h3>No products found</h3>
                            )
                        }

                    </Row>

                </Col>

            </Row>

            <Row>

                <Col>

                    {products.metadata && (<PaginationDisplay metadata={products.metadata} />)}

                </Col>

            </Row>

        </>

    )

}

export default AllProducts