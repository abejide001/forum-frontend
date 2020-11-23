import { Box, Button, Flex, Link } from '@chakra-ui/core'
import React from 'react'
import { useLogoutMutation, useMeQuery } from "../generated/graphql"
import NextLink from 'next/link'
import { isServer } from '../utils/isServer'
interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery({
        pause: isServer()
    })
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
    let body = null

    if (fetching) {

    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={4} color="white">Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color="white">Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button variant="link" onClick={() => {
                    logout()
                }} isLoading={logoutFetching}>Logout</Button>
            </Flex>
        )
    }
    return (
        <Flex bg="tomato" p={4}>
            <Box ml={"auto"}>
                {body}
            </Box>
        </Flex>
    )
}
