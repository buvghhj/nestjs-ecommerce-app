import { User } from '@/services/user.service'
import React, { FC, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'

interface IAccountDetailsProps {
    user: Record<string, any>
    dispatch: any
    addToast: any
}

const AccountDetails: FC<IAccountDetailsProps> = ({ user, dispatch, addToast }) => {

    const dataForm = {
        name: user?.name,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    const [accountForm, setAccountForm] = useState(dataForm)

    const [isLoading, setIsLoading] = useState(false)

    const handleUpdateAccount = async (e: any) => {

        e.preventDefault()

        try {

            setIsLoading(true)

            const { name, oldPassword, newPassword, confirmPassword } = accountForm

            if (!oldPassword || !newPassword || !confirmPassword) {

                return addToast('Please fill all fields', { appearance: 'error', autoDismiss: true })

            }

            if (newPassword !== confirmPassword) {

                return addToast('Password and confirm password do not match', { appearance: 'error', autoDismiss: true })

            }

            if (newPassword.length < 6) {

                return addToast('Password must be at least 6 characters', { appearance: 'error', autoDismiss: true })

            }

            const payload = { name, oldPassword, newPassword }

            const { success, message, result } = await User.updateUser(user.id, payload)

            if (success) {

                dispatch({ type: 'UPDATE_USER', payload: result })

                return addToast(message, { appearance: 'success', autoDismiss: true })

                setAccountForm({ name: result.name, oldPassword: '', newPassword: '', confirmPassword: '' })


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

            <Card className='mt-3'>

                <Card.Header>Your Account Details</Card.Header>

                <Card.Body>

                    <Form>

                        <Form.Group controlId='formBasicEmail' className='mb-3'>

                            <Form.Label>Full name</Form.Label>

                            <Form.Control
                                type='text'
                                value={user?.name}
                            />

                        </Form.Group>

                        <Form.Group controlId='formBasicEmail' className='mb-3'>

                            <Form.Label>Email</Form.Label>

                            <Form.Control
                                type='text'
                                value={user?.email}
                                disabled
                            />

                        </Form.Group>

                        <Form.Group controlId='formBasicEmail' className='mb-3'>

                            <Form.Label>Old password</Form.Label>

                            <Form.Control
                                type='password'
                                placeholder='Enter your old password'
                                value={accountForm.oldPassword}
                                onChange={(e) => setAccountForm({ ...accountForm, oldPassword: e.target.value })}
                            />

                        </Form.Group>


                        <Form.Group controlId='formBasicEmail' className='mb-3'>

                            <Form.Label>New password</Form.Label>

                            <Form.Control
                                type='password'
                                placeholder='Enter your new password'
                                value={accountForm.newPassword}
                                onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                            />

                        </Form.Group>


                        <Form.Group controlId='formBasicEmail' className='mb-3'>

                            <Form.Label>Confirm password</Form.Label>

                            <Form.Control
                                type='password'
                                placeholder='Enter confirm password'
                                value={accountForm.confirmPassword}
                                onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                            />

                        </Form.Group>

                        <Button
                            variant='info'
                            className='btnAuth'
                            disabled={isLoading}
                            onClick={(e) => handleUpdateAccount(e)}
                        >
                            {
                                isLoading &&
                                (
                                    <span
                                        className='spinner-border spinner-border-sm'
                                        role='status'
                                        aria-hidden='true'
                                    >

                                    </span>
                                )
                            }
                            Update
                        </Button>

                    </Form>

                </Card.Body>

            </Card >

        </>

    )

}

export default AccountDetails