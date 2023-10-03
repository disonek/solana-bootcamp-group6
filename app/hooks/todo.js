import * as anchor from '@coral-xyz/anchor'
import { useEffect, useMemo, useState } from 'react'
import { TODO_PROGRAM_PUBKEY } from '../constants'
import { IDL as profileIdl } from '../constants/idl'
import toast from 'react-hot-toast'
import { SystemProgram } from '@solana/web3.js'
import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { authorFilter } from '../utils'

export function useTodo() {
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()

    const [initialized, setInitialized] = useState(false)
    const [lastTodo, setLastTodo] = useState(0)
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(false)
    const [transactionPending, setTransactionPending] = useState(false)

    const program = useMemo(() => {
        if (anchorWallet) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
            return new anchor.Program(profileIdl, TODO_PROGRAM_PUBKEY, provider)
        }
    }, [connection, anchorWallet])

    useEffect(() => {
        console.log("findProfileAccounts1")
        
        const findProfileAccounts = async () => {
            console.log("findProfileAccounts1", program.programId.toString(), publicKey.toString(), transactionPending)
            if (program && publicKey && !transactionPending) {
                
                try {
                    console.log("findProfileAccounts2")
                    setLoading(true)
                    const [profilePda, profileBump] = await anchor.web3.PublicKey.findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId)
                    const profileAccount = await program.account.userProfile.fetch(profilePda)


                    console.log("findProfileAccounts profileAccount.lastTodo",profileAccount.lastTodo)
                    if (profileAccount) {
                        setLastTodo(profileAccount.lastTodo)
                        setInitialized(true)

                        const todoAccounts = await program.account.todoAccount.all([authorFilter(publicKey.toString())])
                        setTodos(todoAccounts)
                        console.log("findProfileAccounts3")
                    } else {
                        console.log("findProfileAccounts4")
                        setInitialized(false)
                    }
                } catch (error) {
                    console.log(error)
                    setInitialized(false)
                    setTodos([])
                } finally {
                    setLoading(false)
                }
            }
        }

        findProfileAccounts()
    }, [publicKey, program, transactionPending])

    const initializeUser = async () => {

       console.log("initializeUser")
        if (program && publicKey) {
            try {
                setTransactionPending(true)
                const [profilePda, profileBump] = anchor.web3.PublicKey.findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId)

                const tx = await program.methods
                    .initializeUser()
                    .accounts({
                        userProfile: profilePda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc()
                setInitialized(true)
                toast.success('Successfully initialized user.')
            } catch (error) {
                console.log(error)
                toast.error(error.toString())
            } finally {
                setTransactionPending(false)
            }
        }
    }

    const addTodo = async () => {

        console.log("addTodo1")
        if (program && publicKey) {
            console.log("addTodo2")
            try {

                console.log("addTodo3")
                setTransactionPending(true)
                const [profilePda, profileBump] = anchor.web3.PublicKey.findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId)
                const [todoPda, todoBump] = anchor.web3.PublicKey.findProgramAddressSync([utf8.encode('TODO_STATE'), publicKey.toBuffer(), Uint8Array.from([lastTodo]) ], program.programId)

                const content = prompt('Please input todo content')
                if (!content) {
                    setTransactionPending(false)
                    return
                }

                console.log("addTodo4")
                await program.methods
                    .addTodo(content)
                    .accounts({
                        userProfile: profilePda,
                        todoAccount: todoPda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc()
                toast.success('Successfully added todo.')
            } catch (error) {
                console.log(error)
                toast.error(error.toString())
            } finally {
                setTransactionPending(false)
            }
        }
    }

    const markTodo = async (todoPda, todoIdx) => {
        if (program && publicKey) {
            try {
                setTransactionPending(true)
                setLoading(true)
                const [profilePda, profileBump] = anchor.web3.PublicKey.findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId)

                await program.methods
                    .markTodo(todoIdx)
                    .accounts({
                        userProfile: profilePda,
                        todoAccount: todoPda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc()
                toast.success('Successfully marked todo.')
            } catch (error) {
                console.log(error)
                toast.success(error.toString())
            } finally {
                setLoading(false)
                setTransactionPending(false)
            }
        }
    }

    const removeTodo = async (todoPda, todoIdx) => {
        if (program && publicKey) {
            try {
                setTransactionPending(true)
                setLoading(true)
                const [profilePda, profileBump] = anchor.web3.PublicKey.findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId)

                await program.methods
                    .removeTodo(todoIdx)
                    .accounts({
                        userProfile: profilePda,
                        todoAccount: todoPda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc()
                toast.success('Successfully removed todo.')
            } catch (error) {
                console.log(error)
                toast.error(error.toString())
            } finally {
                setLoading(false)
                setTransactionPending(false)
            }
        }
    }

    const incompleteTodos = useMemo(() => todos.filter((todo) => !todo.account.marked), [todos])
    const completedTodos = useMemo(() => todos.filter((todo) => todo.account.marked), [todos])

    return { initialized, initializeUser, loading, transactionPending, completedTodos, incompleteTodos, addTodo, markTodo, removeTodo }
}
