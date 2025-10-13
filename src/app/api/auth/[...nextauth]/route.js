import NextAuth from "next-auth"; // authorization library for Next
import SpotifyProvider from "next-auth/providers/spotify"; // Spotify OAuth

export const authOptions = {
    // setting up the provider (Spotify)
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID, // client ID
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET, // client Secret
      authorization:"https://accounts.spotify.com/authorize?scope=user-read-email user-top-read user-read-recently-played user-read-private",
    }),
  ],
  callbacks: { // callbacks in place to modify the authentication session
    async jwt({ token, account, user, profile}) {
      console.log("=== JWT Callback Called ===");
      console.log("Account object:", account);
      console.log("Token before modification:", token);
      console.log("User object:", user);
      console.log("Profile object:", profile);

      if (account) { // existing account
        token.accessToken = account.access_token; // store Spotify access token
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        console.log("JWT Callback - new token:", token);
      } else {
        console.log("JWT Callback - existing token:", token)
      }
      console.log("Token after modification:", token);
      return token; // return token
    },
    async session({ session, token }) { // send data to frontend
      session.accessToken = token.accessToken; // make token available in frontend
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // NextAuth secret for when we need to login
  debug: true, // adding to log erros to Vercel console
};

const handler = NextAuth(authOptions); // NextAuth handler
export { handler as GET, handler as POST }; // exporting GET and POST so Next.js knows how to handle requests that are coming through this route
