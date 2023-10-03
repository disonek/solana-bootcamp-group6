import Head from 'next/head'
import '../styles/global.css'
import { WalletConnectProvider } from '../components/WalletConnectProvider'
import "@solana/wallet-adapter-react-ui/styles.css"
// Import the solana wallet css

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>Todo App</title>
            </Head>
            <main>
                {/* Wrap provider around App */}
                <WalletConnectProvider>
                    <Component {...pageProps} />
                </WalletConnectProvider>
            </main>
        </>
    )
}

export default MyApp
