import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

export default function checkCompanyId(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const companyId = req.headers["company-id"];

    if (!companyId) {
      return res.status(400).json({
        error: "Company-Id header is required",
        key: "company_id_header_required",
      });
    }

    return handler(req, res);
  };
}
