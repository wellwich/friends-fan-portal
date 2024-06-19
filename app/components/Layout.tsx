import { Child } from "hono/jsx"
import Header from "../islands/Header"
import Footer from "./Footer"

interface LayoutProps {
    children: Child
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div class="">
        </div>
    )
}
export default Layout