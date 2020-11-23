import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import React from 'react'
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql'
import { cacheExchange } from '@urql/exchange-graphcache'
import theme from '../theme'
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql'


function MyApp({ Component, pageProps }) {
  return (
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
  )
}

export default MyApp
