import { NextApiRequest, NextApiResponse } from "next";
import { GradeModel } from "../schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  await GradeModel.findByIdAndDelete(id);
  return res.status(200).json({
    message: "Calificación eliminada",
    success: true,
  });
}
