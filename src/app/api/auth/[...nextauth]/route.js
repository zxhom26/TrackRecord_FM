import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
