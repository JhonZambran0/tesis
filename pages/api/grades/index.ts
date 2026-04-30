import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../backend/middlewares/mongo";
import create from "../../../backend/mongo/grades/create";
import list from "../../../backend/mongo/grades/list";
import update from "../../../backend/mongo/grades/update";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
    switch (req.method) {
      case "GET":
        return await list(req, res);
      case "POST":
        return await create(req, res);
      case "PUT":
        return await update(req, res);
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
