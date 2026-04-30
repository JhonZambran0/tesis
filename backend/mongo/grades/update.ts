import { NextApiRequest, NextApiResponse } from "next";
import { Grade } from "../../types";
import { GradeModel } from "../schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const data: Grade = req.body;
  await GradeModel.findByIdAndUpdate(id, data);
  return res.status(200).json({
    message: "Calificación actualizada",
    success: true,
  });
}
