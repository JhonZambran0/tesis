import { NextApiRequest, NextApiResponse } from "next";
import { Subject } from "../../types";
import FormatedDate from "../../../lib/utils/formated_date";
import { AuditoryModel, CourseSModel, MateriasModel, TiutionSModel } from "../schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const materia = req.body as Subject;
  const userName = req.headers.username as string;

  const resp = await MateriasModel.findOneAndUpdate(
    { _id: materia.id },
    materia
  );

  // Keep embedded subjects in Cursos and Matriculas in sync
  const subjectUpdate = {
    "subjects.$.nombre": materia.nombre,
    "subjects.$.estado": materia.estado,
    "subjects.$.horario": materia.horario,
    "subjects.$.profesor": materia.profesor,
  };
  await CourseSModel.updateMany(
    { "subjects._id": materia.id },
    { $set: subjectUpdate }
  );
  await TiutionSModel.updateMany(
    { "course.subjects._id": materia.id },
    { $set: { "course.subjects.$.profesor": materia.profesor } }
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Edito la materia: " + materia.nombre,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "Materia no encontrado",
      success: false,
    });

  return res.status(200).json({
    message: "Materia editado",
    success: true,
  });
}
