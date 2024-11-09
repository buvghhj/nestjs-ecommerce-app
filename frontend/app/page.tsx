'use client'

import styles from '../styles/Home.module.css'
import { Button, Col, Row } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import ProductItem from "@/components/Products/ProductItem";
import { useRouter } from "next/navigation";
import axios from "axios";

const Home = () => {

  const [products, setProducts] = useState({ latestProducts: [], topRatedProducts: [] })

  const router = useRouter()

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const { data } = await axios.get(`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL : process.env.NEXT_PUBLIC_BASE_API_URL}/products?homepage=true`)

        setProducts(data?.result[0] || {})

      } catch (error) {

        console.error("Error fetching products:", error)

      }

    }

    fetchProducts()

  }, [])

  return (
    <>
      <h3 className={styles.productCats}>Latest Products</h3 >

      <Row className='g-4' xs={4} md={4}>

        {products.latestProducts && products.latestProducts.map((product: Record<string, any>, i: React.Key) => (
          <ProductItem
            product={product}
            userType={'customer'}
            key={i}
          />
        ))}

      </Row>

      <hr />

      <h3 className={styles.productCats}>Top Rated Products</h3 >

      <Row className='g-4' xs={4} md={4}>

        {products.topRatedProducts && products.topRatedProducts.map((product: Record<string, any>, i: React.Key) => (
          <ProductItem
            product={product}
            userType={'customer'}
            key={i}
          />
        ))}



      </Row>

      <Row>

        <Col>
          <Button variant="primary" className={styles.viewMoreBtn} onClick={() => router.push('/products')} >
            View more
          </Button>
        </Col>

      </Row>

    </>
  )
}

export default Home
