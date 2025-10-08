import NextAuth from "next-auth"; // authorization library for Next
import SpotifyProvider from "next-auth/providers/spotify"; // Spotify OAuth

export const authOptions = {
    // setting up the provider (Spotify)
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID, // client ID
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET, // client Secret
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-top-read user-read-recently-played user-read-private",
    }),
  ],
  callbacks: { // callbacks in place to modify the authentication session
    async jwt({ token, account }) {
      if (account) { // existing account
        token.accessToken = account.access_token; // store Spotify access token
      }
      return token; // return token
    },
    async session({ session, token }) { // send data to frontend
      session.accessToken = token.accessToken; // make token available in frontend
      return session;
    },
  },
};

const handler = NextAuth(authOptions); // NextAuth handler
export { handler as GET, handler as POST }; // exporting GET and POST so Next.js knows how to handle requests that are coming through this route
