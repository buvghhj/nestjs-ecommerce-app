import RegisterLogin from '@/components/Auth/RegisterLogin'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const Auth = () => {

    return (

        <Row>

            <Col sm={6} className='mt-3'>

                <RegisterLogin />

            </Col>

            <Col sm={6} className='mt-3'>

                <RegisterLogin isRegisterForm={true} />

            </Col>

        </Row>

    )

}

export default Auth