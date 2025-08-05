import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "../lib/supabase/server";

export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  const supabase = createServerSupabaseClient({ req, res });

  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ error: "AccessToken is required" });
  }

  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.redirect("/login");
      }

      try {
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        );
        const { user_id, email, company_id, provider } =
          decodedRefreshToken as {
            user_id: string;
            email: string;
            company_id: string;
            provider: string;
          };

        const newAccessToken = jwt.sign(
          { user_id, email, company_id, provider },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "1h" }
        );

        const newRefreshToken = jwt.sign(
          { user_id, email, company_id, provider },
          process.env.REFRESH_TOKEN_SECRET!,
          { expiresIn: "7d" }
        );

        const { error: tokenError } = await supabase
          .from("authentications")
          .update({
            access_token: newAccessToken,
            access_token_expires_at: new Date(Date.now() + 3600000),
            refresh_token: newRefreshToken,
            refresh_token_expires_at: new Date(Date.now() + 604800000),
          })
          .eq("email", email)
          .eq("provider", provider);

        if (tokenError) {
          return res.redirect("/login");
        }

        res.setHeader("Set-Cookie", [
          `accessToken=${newAccessToken}; Path=/; Max-Age=3600`,
          `refreshToken=${newRefreshToken}; Path=/; Max-Age=604800`,
        ]);

        return next();
      } catch (refreshError) {
        return res.redirect("/login");
      }
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.redirect("/login");
    } else {
      return res.status(500).json({ error: "Unexpected error occurred" });
    }
  }
}
