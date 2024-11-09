import React, { FC } from 'react'
import { Breadcrumb } from 'react-bootstrap'

interface children {
    text: string
    active?: boolean
    href?: string
}

interface IProps {
    childrens?: children[]
}

const BreadcrumDisplay: FC<IProps> = ({ childrens }) => {

    return (

        <>

            <Breadcrumb style={{ marginTop: '10px' }}>

                {childrens && childrens.map((child) => {

                    return (

                        <Breadcrumb.Item
                            key={child.text}
                            active={child.active}
                            href={child.href}
                        >

                            {child.text}

                        </Breadcrumb.Item>

                    )

                })}

            </Breadcrumb>

        </>

    )
}

export default BreadcrumDisplay