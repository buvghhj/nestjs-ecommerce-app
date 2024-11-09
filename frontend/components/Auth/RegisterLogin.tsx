'use client'

import { Context } from '@/context'
import { User } from '@/services/user.service'
import { useRouter } from 'next/navigation'
import React, { FC, useContext, useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'
import validator from 'validator'

interface IRegisterLoginProps {

    isRegisterForm?: boolean

}

const initialForm = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
}

const RegisterLogin: FC<IRegisterLoginProps> = ({ isRegisterForm = false }) => {

    const { addToast } = useToasts()

    const [authForm, setAuthForm] = useState(initialForm)

    const [otpForm, setOtpForm] = useState({ otp: '', email: '' })

    const [otpTime, setOtpTime] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    const { state: { user }, dispatch } = useContext(Context)

    useEffect(() => {

        if (user && user.email) {

            router.push('/my-account')

        }

    }, [router, user])

    const handleRegister = async (e: any) => {

        e.preventDefault()

        try {

            setIsLoading(true)

            const { email, name, password, confirmPassword } = authForm

            if (!name || !email || !password || !confirmPassword) {

                return addToast('Please fill all fields', { appearance: 'error', autoDismiss: true })

            }

            if (password !== confirmPassword) {

                return addToast('Password and confirm password do not match', { appearance: 'error', autoDismiss: true })

            }

            if (password.length < 6) {

                return addToast('Password must be at least 6 characters', { appearance: 'error', autoDismiss: true })

            }

            if (!validator.isEmail(email)) {

                return addToast('Please enter a valid email address', { appearance: 'error', autoDismiss: true })

            }

            const payload = { name, email, password, type: 'customer' }

            const { success, message } = await User.createUser(payload)

            if (success) {

                setOtpForm({ ...otpForm, email: email })

                setOtpTime(true)

                return addToast(message, { appearance: 'success', autoDismiss: true })


            } else {

                return addToast(message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

        } catch (error: any) {


            if (error.response) {

                return addToast(error.response.data.errorResponse.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        } finally {

            setIsLoading(false)

        }

    }

    const handleResendOtp = async (e: any) => {

        e.preventDefault()

        try {

            const { email } = otpForm

            if (!email) {

                return addToast('Please enter your email address', { appearance: 'error', autoDismiss: true })

            }

            if (!validator.isEmail(email)) {

                return addToast('Please enter a valid email address', { appearance: 'error', autoDismiss: true })

            }

            const { success, message } = await User.resendOtp(email)

            if (success) {

                return addToast(message, { appearance: 'success', autoDismiss: true })

                setOtpTime(true)

            } else {

                return addToast(message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        }

    }

    const handleVerifyOtp = async (e: any) => {

        e.preventDefault()

        try {

            setIsLoading(true)

            const { otp, email } = otpForm

            if (!otp || !email) {

                return addToast('Please enter OTP and email', { appearance: 'error', autoDismiss: true })

            }

            if (!validator.isEmail(email)) {

                return addToast('Please enter a valid email address', { appearance: 'error', autoDismiss: true })

            }

            const { success, message } = await User.verifyOtp(otp, email)

            if (success) {

                return addToast(message, { appearance: 'success', autoDismiss: true })

                setOtpTime(false)

                setAuthForm(initialForm)


            } else {

                return addToast(message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

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

    const handleLogin = async (e: any) => {

        e.preventDefault()

        try {

            setIsLoading(true)

            const { email, password } = authForm

            if (!email || !password) {

                return addToast('Please fill all fields', { appearance: 'error', autoDismiss: true })

            }

            if (!validator.isEmail(email)) {

                return addToast('Please enter a valid email address', { appearance: 'error', autoDismiss: true })

            }

            const payload = { email, password }

            const { success, message, result } = await User.loginUser(payload)

            if (success) {

                setAuthForm(initialForm)

                localStorage.setItem('_user', JSON.stringify(result?.user))

                dispatch({ type: 'LOGIN', payload: result?.user })

                router.push('/my-account')

                return addToast(message, { appearance: 'success', autoDismiss: true })


            } else {

                return addToast(message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

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

            <Card>

                <Card.Header> {isRegisterForm ? 'Register' : 'Login'} </Card.Header>

                <Card.Body>

                    {isRegisterForm &&
                        (

                            <Form.Group className='mb-3'>

                                <Form.Label>Full name</Form.Label>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter full name'
                                    value={authForm.name}
                                    disabled={otpTime}
                                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                                />

                            </Form.Group>

                        )
                    }

                    <Form.Group className='mb-3'>

                        <Form.Label>Email address</Form.Label>

                        <Form.Control
                            type='email'
                            placeholder='Enter email address'
                            value={authForm.email || otpForm.email}
                            disabled={otpTime}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        />

                    </Form.Group>


                    <Form.Group className='mb-3'>

                        <Form.Label>Password</Form.Label>

                        <Form.Control
                            type='password'
                            placeholder='Enter password'
                            value={authForm.password}
                            disabled={otpTime}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        />

                    </Form.Group>

                    {isRegisterForm &&
                        (

                            <Form.Group className='mb-3'>

                                <Form.Label>Confirm password</Form.Label>

                                <Form.Control
                                    type='password'
                                    placeholder='Enter confirm password'
                                    value={authForm.confirmPassword}
                                    disabled={otpTime}
                                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                                />

                            </Form.Group>

                        )
                    }

                    {otpTime &&
                        (
                            <Form.Group>

                                <Form.Label>OTP</Form.Label>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter OTP'
                                    value={otpForm.otp}
                                    onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                                />

                                <Button
                                    variant='link'
                                    className='resendOtpBtn'
                                    onClick={(e) => { handleResendOtp(e) }}
                                >
                                    Resend OTP
                                </Button>

                            </Form.Group>
                        )
                    }

                    {otpTime
                        ?
                        (
                            <Button
                                className='btnAuth'
                                variant='info'
                                onClick={(e) => handleVerifyOtp(e)}
                            >

                                Verify

                            </Button>

                        )
                        :
                        (
                            <Button
                                className='btnAuth'
                                variant='info'
                                onClick={(e) => isRegisterForm ? handleRegister(e) : handleLogin(e)}
                            >

                                {isRegisterForm ? "Register" : "Login"}

                            </Button>

                        )
                    }

                    {!isRegisterForm &&
                        (
                            <a
                                style={{ textDecoration: 'none' }}
                                href='/forgot-password'
                            >
                                Forgot your password?
                            </a>
                        )
                    }

                </Card.Body>

            </Card>

        </>

    )

}

export default RegisterLogin