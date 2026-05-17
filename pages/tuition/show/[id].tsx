
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../../lib/components/sidebar";
import { useAuth } from "../../../lib/hooks/use_auth";
import HttpClient from "../../../lib/utils/http_client";
import LoadingContainer from "../../../lib/components/loading_container";
import Router from "next/router";

const MatriculasID = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [matricula, setMatricula] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const id = router.query.id as string;
    const response = await HttpClient(
      "/api/tuition/" + id,
      "GET",
      auth.userName,
      auth.role
    );
    if (response.success) {
      setMatricula(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <>
      <title>Ficha de Matrícula</title>
      <div className="flex h-full">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-start justify-center py-10">
          <div className="w-11/12 bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => Router.back()}
                className="mr-4 text-red-500 border border-red-500 rounded px-3 py-1 hover:bg-red-500 hover:text-white text-sm"
              >
                ← Volver
              </button>
              <h2 className="text-2xl font-bold text-center flex-1">
                Ficha de Matrícula
              </h2>
            </div>
            <LoadingContainer visible={loading} miniVersion>
              {matricula ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos del estudiante */}
                  <div className="bg-slate-50 rounded-lg p-5 border">
                    <h3 className="text-lg font-semibold text-red-600 mb-3 border-b pb-2">
                      Datos del Estudiante
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Nombre completo:</span>{" "}
                        <strong>
                          {matricula.student?.nombre} {matricula.student?.apellido}
                        </strong>
                      </p>
                      <p>
                        <span className="font-medium">Cédula:</span>{" "}
                        <strong>{matricula.student?.dni}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        <strong>{matricula.student?.email}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Fecha de nacimiento:</span>{" "}
                        <strong>{matricula.student?.fechaNacimiento}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Género:</span>{" "}
                        <strong>{matricula.student?.genero}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Teléfono:</span>{" "}
                        <strong>{matricula.student?.telefono}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Dirección:</span>{" "}
                        <strong>{matricula.student?.direccion}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Nombre del representante:</span>{" "}
                        <strong>{matricula.student?.nombreRepresentante}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Datos académicos */}
                  <div className="bg-slate-50 rounded-lg p-5 border">
                    <h3 className="text-lg font-semibold text-red-600 mb-3 border-b pb-2">
                      Datos Académicos
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Curso:</span>{" "}
                        <strong>{matricula.course?.name}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Nivel:</span>{" "}
                        <strong>{matricula.course?.level}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Paralelo:</span>{" "}
                        <strong>{matricula.parallel?.name}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Período académico:</span>{" "}
                        <strong>{matricula.period?.nombre}</strong>
                      </p>
                      <p>
                        <span className="font-medium">Año:</span>{" "}
                        <strong>{matricula.period?.año}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Materias del curso */}
                  {matricula.course?.subjects?.length > 0 && (
                    <div className="md:col-span-2 bg-slate-50 rounded-lg p-5 border">
                      <h3 className="text-lg font-semibold text-red-600 mb-3 border-b pb-2">
                        Materias del Curso
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-red-100">
                              <th className="text-left p-2 border">Materia</th>
                              <th className="text-left p-2 border">Horario</th>
                              <th className="text-left p-2 border">Estado</th>
                              <th className="text-left p-2 border">Docente(s)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matricula.course.subjects.map((subject: any, idx: number) => (
                              <tr key={idx} className="border-b hover:bg-slate-100">
                                <td className="p-2 border">{subject.nombre}</td>
                                <td className="p-2 border">{subject.horario}</td>
                                <td className="p-2 border">{subject.estado}</td>
                                <td className="p-2 border">
                                  {(subject.profesor ?? [])
                                    .map((p: any) => `${p.nombre} ${p.apellido}`)
                                    .join(", ") || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No se encontró la matrícula.
                </p>
              )}
            </LoadingContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatriculasID;