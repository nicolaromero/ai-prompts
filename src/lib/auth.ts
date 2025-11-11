import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { getPool } from "./db";

export const auth = betterAuth({
  database: getPool(),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: "owner",
      membershipLimit: 100,
      async sendInvitationEmail(data) {
        // TODO: Implement email sending
        console.log("Invitation email:", {
          email: data.email,
          organizationId: data.organizationId,
          invitationId: data.id,
          inviteLink: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/accept-invitation/${data.id}`,
        });
      },
    }),
  ],
});
