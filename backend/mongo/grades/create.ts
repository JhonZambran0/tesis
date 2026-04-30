import { NextApiRequest, NextApiResponse } from "next";
import { Grade } from "../../types";
import { GradeModel } from "../schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data: Grade = req.body;
  const grade = new GradeModel(data);
  await grade.save();
  return res.status(200).json({
    message: "Calificación registrada",
    data: grade as Grade,
    success: true,
  });
}
