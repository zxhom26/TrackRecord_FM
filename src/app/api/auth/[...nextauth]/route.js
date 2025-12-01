import NextAuth from "next-auth"; // import nextauth for authentication
import SpotifyProvider from "next-auth/providers/spotify"; // import the spotify provider (OAuth) -- automatic handling of redirect -> spotify -> callback

async function refreshAccessToken(token) { // used to refresh the access token upon expiration
  try {
    // puts params in required spotify format
    const params = new URLSearchParams(); 
    params.append("grant_type", "refresh_token"); // tells spotify what action to perform
    params.append("refresh_token", token.refreshToken);

    const response = await fetch("https://accounts.spotify.com/api/token", { // call spotify's token endpoint
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(), // covert the body to a string
    });

    const refreshed = await response.json(); // covert respone into a js 

    if (!response.ok) throw refreshed; // refresh if response not 200

    return {
      ...token, // keep previous fields
      accessToken: refreshed.access_token, // replace old token with refreshed
      expiresAt: Date.now() + refreshed.expires_in * 1000, // compute expiration timestamp
      refreshToken: refreshed.refresh_token ?? token.refreshToken, // use refreshed token if provided, if not keep old one
    };
  } catch (error) { // log any errors
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({ // OAuth provider
      clientId: process.env.SPOTIFY_CLIENT_ID, // read secret variables
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-read-email user-top-read user-read-recently-played user-read-private", // permissions that the user needs to give (email, top tracks/artists, recently played songs, basic profile information)
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // print debig logs in terminal 

  callbacks: {
    async jwt({ token, account }) { // handles token that is stored in cookie
      // Initial login (first authentication)
      if (account) { // store token info in custom JWT object
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: Date.now() + account.expires_in * 1000,
        };
      }

      // If token not expired, return it
      if (Date.now() < token.expiresAt) {
        return token;
      }

      // Otherwise refresh it
      return await refreshAccessToken(token);
    },
    // mapping JWT to a session for multiple users
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
