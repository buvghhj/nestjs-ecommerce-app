import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { Card, Dropdown, DropdownButton, ListGroup } from 'react-bootstrap'
import styles from '../../styles/Home.module.css'

const ProductFilter = () => {

    const router = useRouter()

    const searchParams = useSearchParams()

    const [filterCatText, setFilterCatText] = useState('Category')

    const [filterPlatformText, setfilterPlatformText] = useState('Platform')


    const handleSortChange = (sort: string) => {

        const params = new URLSearchParams(searchParams.toString())

        if (sort) {

            params.set('sort', sort)

        } else {

            params.delete('sort')

        }

        router.push(`?${params.toString()}`)

    }


    return (

        <>

            <Card>

                <Card.Header>Filter By</Card.Header>

                <ListGroup variant='flush'>

                    <ListGroup.Item>

                        <DropdownButton
                            variant="outline-secondary"
                            id="input-group-dropdown-1"
                            title={filterCatText}
                            className={styles.dropdownBtn}
                            onSelect={(e) => {
                                if (e) {

                                    setFilterCatText(e === 'Application Software' ? "Application" : e === 'Operating System' ? 'OS' : 'Category')

                                    handleSortChange(e)

                                } else {

                                    setFilterCatText("Category")

                                    handleSortChange('')

                                }

                            }}
                        >

                            <Dropdown.Item eventKey=''>Category</Dropdown.Item>

                            <Dropdown.Item eventKey='Operating System'>OS</Dropdown.Item>

                            <Dropdown.Item eventKey='Application Software'>Application </Dropdown.Item>

                        </DropdownButton>


                    </ListGroup.Item>

                    <ListGroup.Item>

                        <DropdownButton
                            variant="outline-secondary"
                            id="input-group-dropdown-1"
                            title={filterPlatformText}
                            className={styles.dropdownBtn}
                            onSelect={(e) => {
                                if (e) {

                                    setfilterPlatformText(e === 'Windows' ? "Windows" : e === 'Mac' ? 'Mac' : e === 'Linux' ? 'Linux' : e === 'Android' ? 'Android' : e === 'iOS' ? 'iOS' : 'Platform')

                                    handleSortChange(e)

                                } else {

                                    setfilterPlatformText("Platform")

                                    handleSortChange('')

                                }

                            }}
                        >
                            <Dropdown.Item eventKey=''>Platform</Dropdown.Item>

                            <Dropdown.Item eventKey='Windows'>Windows</Dropdown.Item>

                            <Dropdown.Item eventKey='Mac'>Mac</Dropdown.Item>

                            <Dropdown.Item eventKey='Linux'>Linux</Dropdown.Item>

                            <Dropdown.Item eventKey='Android'>Android</Dropdown.Item>

                            <Dropdown.Item eventKey='iOS'>iOS</Dropdown.Item>

                        </DropdownButton>


                    </ListGroup.Item>

                </ListGroup>

            </Card>

        </>

    )

}

export default ProductFilter