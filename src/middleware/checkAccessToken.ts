import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";

export default function checkAccessToken(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "AccessToken is required",
        key: "access_token_required",
      });
    }

    const token = authorizationHeader.split(" ")[1];

    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch (error) {
      return res.status(401).json({
        error: "Invalid AccessToken",
        key: "invalid_access_token",
      });
    }

    return handler(req, res);
  };
}
