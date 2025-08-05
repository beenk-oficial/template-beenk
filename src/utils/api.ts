import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";

export function decodedAccessToken(
    req: NextApiRequest
) {
    const authorizationHeader = req.headers["authorization"] ?? "";

    const token = authorizationHeader.split(" ")[1];

    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
    ) as {
        user_id: string;
        email: string;
        company_id: string;
        provider: string;
    }
}