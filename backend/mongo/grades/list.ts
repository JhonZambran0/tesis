import { NextApiRequest, NextApiResponse } from "next";
import { Grade } from "../../types";
import { GradeModel } from "../schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const grades = await GradeModel.find({});
  return res.status(200).json({
    message: "todas las calificaciones",
    data: grades as Array<Grade>,
    success: true,
  });
}
