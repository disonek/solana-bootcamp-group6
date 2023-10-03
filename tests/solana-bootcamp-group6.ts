import { expect } from "chai";
import * as anchor from "@coral-xyz/anchor";
import { Todo } from "../target/types/todo";
import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

const { SystemProgram } = anchor.web3;

describe("todo", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Todo as anchor.Program<Todo>;

  const userKeypair = anchor.web3.Keypair.generate();


  console.log('program.programId->', program.programId);
  const [userProfilePda, userProfileBump] =
    anchor.web3.PublicKey.findProgramAddressSync([
      utf8.encode('USER_STATE'),
      userKeypair.publicKey.toBuffer()],
      program.programId);

  console.log('userProfilePda->', userProfilePda.toString());
  console.log('userKeypair->', userKeypair.publicKey.toString());

  before(async () => {
    // Top up all acounts that will need lamports for account creation
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        userKeypair.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );

  });

  it("Is initialized!", async () => {
    await program.methods
      .initializeUser()
      .accounts({
        authority: userKeypair.publicKey,
        userProfile: userProfilePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([userKeypair])
      .rpc()
  })

  it("Add todo", async () => {
    let profileAccount = await program.account.userProfile.fetch(userProfilePda);
    console.log(profileAccount.lastTodo);

    const [todoPda, todoBump] =
      anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('TODO_STATE'),
        userKeypair.publicKey.toBuffer(),
        new anchor.BN(profileAccount.lastTodo).toArrayLike(Buffer)],
        program.programId);

    console.log('todoPda->', todoPda.toString());

    await program.methods
      .addTodo('fisrt task')
      .accounts({
        authority: userKeypair.publicKey,
        userProfile: userProfilePda,
        todoAccount: todoPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([userKeypair])
      .rpc()


    // console.log(todoPda.toString());
    const todoAccount = await program.account.todoAccount.fetch(todoPda);
    profileAccount = await program.account.userProfile.fetch(userProfilePda);
    console.log(profileAccount.lastTodo);


  })


})