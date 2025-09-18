import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { User } from "next-auth"

export const authOptions = {
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

        const client: MongoClient = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const usersCollection = db.collection("users")

        const user = await usersCollection.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password as string)

        if (!passwordsMatch) {
          return null
        }

        return user
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        }
    },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login"
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

