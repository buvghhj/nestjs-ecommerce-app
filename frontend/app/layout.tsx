'use client'

import Heading from "@/components/shared/Heading"
import TopHeader from "@/components/shared/TopHeader"
import { Provider } from "@/context"
import { Container } from "react-bootstrap"
import { ToastContainer } from "react-toastify"
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Footer from "@/components/shared/Footer"
import { ToastProvider } from "react-toast-notifications"

export const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {

  return (

    <html lang="en">

      <body>

        <Provider>

          <ToastProvider >

            <Heading />

            <Container>

              <TopHeader />

              {children}

              <Footer />

            </Container>

          </ToastProvider>

        </Provider>

      </body>

    </html >

  )

}

export default RootLayout
