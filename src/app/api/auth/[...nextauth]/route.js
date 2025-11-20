import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

async function refreshAccessToken(token) {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", token.refreshToken);

    const response = await fetch("https://accounts.spotify.com/api/token", {
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
      body: params.toString(),
    });

    const refreshed = await response.json();

    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-read-email user-top-read user-read-recently-played user-read-private",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  debug: true,

  callbacks: {
    async jwt({ token, account }) {
      // Initial login
      if (account) {
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
