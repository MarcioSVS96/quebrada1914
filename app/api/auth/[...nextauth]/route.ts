import NextAuth, { AuthOptions, Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { MongoClient } from "mongodb"

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        // A conexão com o MongoDB já é gerenciada pelo adapter, podemos reutilizá-la.
        const client = await clientPromise
        const usersCollection = client.db(process.env.MONGODB_DB).collection("users")

        const user = await usersCollection.findOne({ email: credentials.email })

        if (!user) {
          console.log("Usuário não encontrado")
          return null
        }

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password as string)

        if (!passwordsMatch) {
          console.log("Senha incorreta")
          return null
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
        async session({ session, token }: { session: Session, token: JWT }) {
            if (token && session.user) {
                // We are sure token.id and token.email are strings because we set them in the jwt callback
                session.user.id = token.id as string
                session.user.email = token.email as string
            }
            return session;
        },
        async jwt({ token, user }: { token: JWT, user: User }) {
            if (user) {
                // On the first sign-in, the user object is available.
                // We add the user's ID and email to the token.
                if (user.id) token.id = user.id;
                if (user.email) token.email = user.email;
            }
            return token;
        }
    },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/"
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
