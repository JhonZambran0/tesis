import { NextApiRequest, NextApiResponse } from "next";
import FormatedDate from "../../../lib/utils/formated_date";
import { AuditoryModel, UserModel } from "../schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const userName = req.headers.username as string;
  const resp = await UserModel.findByIdAndRemove(id);

  if (resp === null)
    return res.status(500).json({
      message: "Usuario no encontrado",
      success: false,
    });

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Elimino un Usuario: " + resp.name,
  });
  await auditory.save();

  return res.status(200).json({
    message: "Eliminado!",
    success: true,
  });
}
