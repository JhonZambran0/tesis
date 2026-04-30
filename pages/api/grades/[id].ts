import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../backend/middlewares/mongo";
import remove from "../../../backend/mongo/grades/delete";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
    switch (req.method) {
      case "DELETE":
        return await remove(req, res);
      default:
        throw new Error("Invalid method");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: new Error(error).message,
      success: false,
    });
  }
}
