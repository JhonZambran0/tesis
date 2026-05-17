/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Sidebar from "../lib/components/sidebar";
import { useAuth } from "../lib/hooks/use_auth";
import { CheckPermissions } from "../lib/utils/check_permissions";
import HttpClient from "../lib/utils/http_client";

export default function Home() {
  const { auth } = useAuth();

  // --- Estado docente ---
  const [consolidatedData, setConsolidatedData] = useState<any[]>([]);
  const [teacherGrades, setTeacherGrades] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalForm, setModalForm] = useState({ grade: "", descripcion: "", bimestre: "" });
  const [savingGrade, setSavingGrade] = useState(false);

  // --- Estado admin ---
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [allPeriods, setAllPeriods] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allTuitions, setAllTuitions] = useState<any[]>([]);
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterStudentReport, setFilterStudentReport] = useState("");
  const [filterPeriodReport, setFilterPeriodReport] = useState("");
  const [loadingReport1, setLoadingReport1] = useState(false);
  const [loadingReport2, setLoadingReport2] = useState(false);
  const [report1Searched, setReport1Searched] = useState(false);
  const [report2Grades, setReport2Grades] = useState<any[]>([]);

  // ---- Admin: cargar datos base (sin grades) ----
  const loadAdminData = async () => {
    const [periodsRes, coursesRes, teachersRes, studentsRes, tuitionsRes] = await Promise.all([
      HttpClient("/api/period", "GET", auth.userName, auth.role),
      HttpClient("/api/courses", "GET", auth.userName, auth.role),
      HttpClient("/api/teachers", "GET", auth.userName, auth.role),
      HttpClient("/api/students", "GET", auth.userName, auth.role),
      HttpClient("/api/tuition", "GET", auth.userName, auth.role),
    ]);
    if (periodsRes.success) setAllPeriods(periodsRes.data ?? []);
    if (coursesRes.success) setAllCourses(coursesRes.data ?? []);
    if (teachersRes.success) setAllTeachers(teachersRes.data ?? []);
    if (studentsRes.success) setAllStudents(studentsRes.data ?? []);
    if (tuitionsRes.success) setAllTuitions(tuitionsRes.data ?? []);
  };

  // ---- Admin: estudiantes del período seleccionado ----
  const studentsForPeriod = filterPeriodReport
    ? (() => {
        const seen = new Set<string>();
        const result: any[] = [];
        allTuitions.forEach((t) => {
          const pid = (t.period?._id ?? t.period?.id ?? "").toString();
          if (pid !== filterPeriodReport) return;
          const s = t.student;
          if (!s) return;
          const sid = (s._id ?? s.id ?? "").toString();
          if (!seen.has(sid)) {
            seen.add(sid);
            result.push(s);
          }
        });
        return result;
      })()
    : [];

  // ---- Admin: buscar reporte 1 ----
  const buscarReporte1 = async () => {
    setLoadingReport1(true);
    setReport1Searched(true);
    const gradesRes = await HttpClient("/api/grades", "GET", auth.userName, auth.role);
    if (gradesRes.success) setAllGrades(gradesRes.data ?? []);
    setLoadingReport1(false);
  };

  // ---- Admin: buscar reporte 2 (por estudiante) ----
  const buscarReporte2 = async (studentId?: string, periodId?: string) => {
    const sid = studentId ?? filterStudentReport;
    const pid = periodId ?? filterPeriodReport;
    if (!sid) { setReport2Grades([]); return; }
    setLoadingReport2(true);
    const gradesRes = await HttpClient("/api/grades", "GET", auth.userName, auth.role);
    if (gradesRes.success) {
      const grades = gradesRes.data ?? [];
      const filtered = grades.filter((g: any) => {
        const gsid = (g.student?._id ?? g.student?.id ?? "").toString();
        const gpid = (g.period?._id ?? g.period?.id ?? "").toString();
        const matchStudent = gsid === sid.toString();
        const matchPeriod = pid ? gpid === pid.toString() : true;
        return matchStudent && matchPeriod;
      });
      setReport2Grades(filtered);
    }
    setLoadingReport2(false);
  };

  // ---- Admin: filtros reporte 1 (sobre grades ya cargados) ----
  const filteredGrades = allGrades.filter((g) => {
    const matchPeriod = filterPeriod
      ? g.period?._id === filterPeriod || g.period?.id === filterPeriod
      : true;
    const matchCourse = filterCourse
      ? g.course?._id === filterCourse || g.course?.id === filterCourse
      : true;
    const matchTeacher = filterTeacher
      ? g.teacher?._id === filterTeacher || g.teacher?.id === filterTeacher
      : true;
    return matchPeriod && matchCourse && matchTeacher;
  });

  // ---- Docente: obtener todas las calificaciones de un estudiante en una materia ----
  const getTeacherGrades = (studentId: string, subjectId: string) => {
    return teacherGrades.filter(
      (gr) =>
        (gr.student?._id?.toString() === studentId?.toString() ||
          gr.student?.id?.toString() === studentId?.toString()) &&
        (gr.subject?._id?.toString() === subjectId?.toString() ||
          gr.subject?.id?.toString() === subjectId?.toString())
    );
  };

  // ---- Docente: abrir modal ----
  const openModal = (
    student: any,
    subject: any,
    courseObj: any,
    periodObj: any,
    teacherObj: any
  ) => {
    setModalData({ student, subject, courseObj, periodObj, teacherObj });
    setModalForm({ grade: "", descripcion: "", bimestre: "" });
    setModalOpen(true);
  };

  // ---- Docente: guardar calificación ----
  const handleSaveGrade = async () => {
    if (!modalForm.grade || !modalForm.bimestre || !modalData) return;
    setSavingGrade(true);
    await HttpClient("/api/grades", "POST", auth.userName, auth.role, {
      student: modalData.student,
      subject: modalData.subject,
      course: modalData.courseObj,
      grade: Number(modalForm.grade),
      bimestre: modalForm.bimestre,
      descripcion: modalForm.descripcion ?? "",
      period: modalData.periodObj,
      teacher: modalData.teacherObj,
    });
    const gradesRes = await HttpClient("/api/grades", "GET", auth.userName, auth.role);
    if (gradesRes.success) setTeacherGrades(gradesRes.data ?? []);
    setModalOpen(false);
    setSavingGrade(false);
  };

  // ---- Docente: cargar datos ----
  const loadData = async () => {
    const teacherId = auth?.teacherId;
    if (!teacherId) return;

    const [teachersRes, tuitionRes, gradesRes, materiasRes] = await Promise.all([
      HttpClient("/api/teachers", "GET", auth.userName, auth.role),
      HttpClient("/api/tuition", "GET", auth.userName, auth.role),
      HttpClient("/api/grades", "GET", auth.userName, auth.role),
      HttpClient("/api/materias", "GET", auth.userName, auth.role),
    ]);

    // Find the teacher object by linked ID
    let teacherObj = null;
    if (teachersRes.success) {
      teacherObj =
        (teachersRes.data ?? []).find(
          (t: any) => (t.id ?? t._id)?.toString() === teacherId
        ) ?? null;
    }

    // Find all materias where this teacher is assigned as professor (by ID)
    const myMaterias: any[] = materiasRes.success
      ? (materiasRes.data ?? []).filter((m: any) =>
          (m.profesor ?? []).some(
            (p: any) => (p.id ?? p._id)?.toString() === teacherId
          )
        )
      : [];
    const myMateriaIds = new Set(
      myMaterias.map((m: any) => (m._id ?? m.id)?.toString())
    );

    if (gradesRes.success) setTeacherGrades(gradesRes.data ?? []);

    if (tuitionRes.success) {
      const groupedData: any = {};
      (tuitionRes.data ?? []).forEach((tuition: any) => {
        const { course, period, parallel } = tuition;
        if (!course || !period || !parallel) return;

        // Match subjects in this tuition's course to the teacher's materias by ID
        const teacherSubjectsInCourse = (course.subjects ?? []).filter((s: any) =>
          myMateriaIds.has((s._id ?? s.id)?.toString())
        );
        if (teacherSubjectsInCourse.length === 0) return;

        const key = `${course._id}-${period._id}-${parallel._id}`;
        if (!groupedData[key]) {
          groupedData[key] = {
            courseObj: course,
            periodObj: period,
            courseName: course.name,
            periodName: period.nombre,
            parallelName: parallel.name,
            students: [],
            // Use live materia data so profesor/horario/estado are up to date
            subjects: teacherSubjectsInCourse.map((s: any) => {
              const live = myMaterias.find(
                (m: any) =>
                  (m._id ?? m.id)?.toString() === (s._id ?? s.id)?.toString()
              );
              return live ?? s;
            }),
            teacherObj,
          };
        }
        if (tuition.student && tuition.student.nombre) {
          const already = groupedData[key].students.some(
            (st: any) => st._id === tuition.student._id
          );
          if (!already) groupedData[key].students.push(tuition.student);
        }
      });
      setConsolidatedData(Object.values(groupedData) as any[]);
    }
  };

  useEffect(() => {
    if (!auth) return;
    if (CheckPermissions(auth, [2])) loadData();
    if (CheckPermissions(auth, [0, 1, 3, 4])) loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return (
    <>
      <title>Generaciones del futuro</title>
      <div className="flex min-h-screen">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 overflow-y-auto">
          <div className="mt-6" style={{ display: "flex", alignItems: "center" }}>
            <p
              className="md:text-4xl text-xl text-center m-6"
              style={{
                display: "inline-block",
                color: "#610d9a",
                padding: "12px",
                fontSize: "40px",
                fontWeight: "bold",
              }}
            >
              <strong>Unidad Educativa "Generaciones del futuro"</strong>
            </p>
          </div>

          {/* ===== VISTA ADMIN / RECTOR ===== */}
          {CheckPermissions(auth, [0, 1, 3, 4]) && (
            <div className="w-11/12 mx-auto pb-8 space-y-4">

              {/* Reporte 1: por curso y docente */}
              <div className="bg-white rounded-lg shadow px-5 py-4">
                <h2 className="text-xl font-bold mb-4">
                  Reporte de Calificaciones por curso y docente
                </h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Periodo Académico:</label>
                    <select
                      className="border rounded px-3 py-1 text-sm min-w-[220px]"
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {allPeriods.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Curso:</label>
                    <select
                      className="border rounded px-3 py-1 text-sm min-w-[160px]"
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {allCourses.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Docente:</label>
                    <select
                      className="border rounded px-3 py-1 text-sm min-w-[200px]"
                      value={filterTeacher}
                      onChange={(e) => setFilterTeacher(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {allTeachers.map((t) => (
                        <option key={t._id || t.id} value={t._id || t.id}>
                          {t.nombre} {t.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="px-5 py-1 rounded text-white text-sm font-semibold"
                      style={{ backgroundColor: "#4e73df" }}
                      onClick={buscarReporte1}
                      disabled={loadingReport1}
                    >
                      {loadingReport1 ? "Cargando..." : "Buscar"}
                    </button>
                  </div>
                </div>
                <div>
                  {!report1Searched ? (
                    <p className="text-gray-400 text-sm">Selecciona los filtros y presiona Buscar.</p>
                  ) : loadingReport1 ? (
                    <p className="text-gray-500 text-sm">Cargando calificaciones...</p>
                  ) : filteredGrades.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay calificaciones registradas.</p>
                  ) : (
                    filteredGrades.map((g, i) => (
                      <div key={i} className="border-b py-3">
                        <p className="font-bold">
                          {g.student?.nombre} {g.student?.apellido}
                        </p>
                        <p>
                          <span className="font-semibold">Materia:</span> {g.subject?.nombre}
                        </p>
                        <p>
                          <span className="font-semibold">Docente:</span> {g.teacher?.nombre}{" "}
                          {g.teacher?.apellido}
                        </p>
                        <p>
                          <span className="font-semibold">Curso:</span> {g.course?.name}
                        </p>
                        <p>
                          <span className="font-semibold">Periodo:</span> {g.period?.nombre}
                        </p>
                        <p>
                          <span className="font-semibold">Calificación:</span> {g.grade}
                        </p>
                        <p>
                          <span className="font-semibold">Bimestre:</span> {g.bimestre}
                        </p>
                        <p>
                          <span className="font-semibold">Descripción:</span> {g.descripcion}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reporte 2: por estudiante */}
              <div className="bg-white rounded-lg shadow px-5 py-4">
                <h2 className="text-xl font-bold mb-4">Reporte de académico por estudiante</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Periodo:</label>
                    <select
                      className="border rounded px-3 py-1 text-sm min-w-[220px]"
                      value={filterPeriodReport}
                      onChange={(e) => {
                        setFilterPeriodReport(e.target.value);
                        setFilterStudentReport("");
                        setReport2Grades([]);
                      }}
                    >
                      <option value="">Seleccionar período...</option>
                      {allPeriods.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estudiante:</label>
                    <select
                      className="border rounded px-3 py-1 text-sm min-w-[220px]"
                      value={filterStudentReport}
                      onChange={(e) => setFilterStudentReport(e.target.value)}
                      disabled={!filterPeriodReport}
                    >
                      <option value="">
                        {filterPeriodReport ? "Seleccionar estudiante..." : "Primero selecciona un período"}
                      </option>
                      {studentsForPeriod.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.nombre} {s.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="px-5 py-1 rounded text-white text-sm font-semibold"
                      style={{ backgroundColor: "#4e73df" }}
                      onClick={() => buscarReporte2()}
                      disabled={loadingReport2 || !filterStudentReport}
                    >
                      {loadingReport2 ? "Cargando..." : "Buscar"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {!filterStudentReport ? (
                    <p className="text-gray-400 text-sm col-span-2">Selecciona un estudiante para ver sus calificaciones.</p>
                  ) : loadingReport2 ? (
                    <p className="text-gray-500 text-sm col-span-2">Cargando calificaciones...</p>
                  ) : report2Grades.length === 0 ? (
                    <p className="text-gray-500 text-sm col-span-2">
                      No hay calificaciones para este estudiante.
                    </p>
                  ) : (
                    report2Grades.map((g, i) => (
                      <div key={i} className="border rounded p-3">
                        <p className="font-bold">Materia: {g.subject?.nombre}</p>
                        <p>
                          <span className="font-semibold">Docente:</span> {g.teacher?.nombre}{" "}
                          {g.teacher?.apellido}
                        </p>
                        <p>
                          <span className="font-semibold">Calificación:</span> {g.grade}
                        </p>
                        <p>
                          <span className="font-semibold">Bimestre:</span> {g.bimestre}
                        </p>
                        <p>
                          <span className="font-semibold">Descripción:</span> {g.descripcion}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== VISTA DOCENTE ===== */}
          {CheckPermissions(auth, [2]) && (
            <>
              {/* Modal registrar calificación */}
              {modalOpen && modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-bold text-center mb-4">Registrar Calificación</h3>
                    <p className="mb-1">
                      <span className="font-semibold">Materia:</span> {modalData.subject?.nombre}
                    </p>
                    <p className="mb-1">
                      <span className="font-semibold">Profesor:</span>{" "}
                      {modalData.teacherObj?.nombre} {modalData.teacherObj?.apellido}
                    </p>
                    <p className="mb-4">
                      <span className="font-semibold">Periodo:</span>{" "}
                      {modalData.periodObj?.nombre}
                    </p>
                    <input
                      type="number"
                      className="border rounded w-full px-3 py-2 mb-3 text-sm"
                      placeholder="Calificación (0-20)"
                      min={0}
                      max={20}
                      value={modalForm.grade}
                      onChange={(e) => setModalForm((p) => ({ ...p, grade: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="border rounded w-full px-3 py-2 mb-3 text-sm"
                      placeholder="Descripción (Ej: Tarea 1 bimestre 1)"
                      value={modalForm.descripcion}
                      onChange={(e) =>
                        setModalForm((p) => ({ ...p, descripcion: e.target.value }))
                      }
                    />
                    <select
                      className="border rounded w-full px-3 py-2 mb-5 text-sm"
                      value={modalForm.bimestre}
                      onChange={(e) => setModalForm((p) => ({ ...p, bimestre: e.target.value }))}
                    >
                      <option value="">Seleccionar Bimestre</option>
                      <option value="Primer Bimestre">Primer Bimestre</option>
                      <option value="Segundo Bimestre">Segundo Bimestre</option>
                    </select>
                    <div className="flex gap-3">
                      <button
                        className="flex-1 py-2 rounded text-white text-sm font-semibold"
                        style={{ backgroundColor: "#4e73df" }}
                        disabled={savingGrade}
                        onClick={handleSaveGrade}
                      >
                        {savingGrade ? "Guardando..." : "Guardar Calificación"}
                      </button>
                      <button
                        className="flex-1 py-2 rounded text-white text-sm font-semibold bg-gray-500"
                        onClick={() => setModalOpen(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-11/12 bg-white mx-auto block px-5 py-3 mb-8">
                <h2 className="text-center text-2xl my-3 font-bold">
                  {consolidatedData[0]?.periodName}
                </h2>
                <h3 className="text-xl font-semibold mb-3">Listado de cursos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {consolidatedData.length > 0 ? (
                    consolidatedData.map((data, index) => (
                      <div
                        className="rounded overflow-hidden shadow-lg my-2 p-3 bg-slate-100"
                        key={index}
                      >
                        <h2 className="text-center font-semibold mb-3">
                          {data.courseName} - {data.parallelName}
                        </h2>
                        {data.subjects.map((subject: any) => (
                          <div key={subject._id} className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-semibold text-sm">
                                Materia: {subject.nombre}
                              </p>
                              {subject.horario ? (
                                <span className="bg-yellow-300 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                                  Horario: {subject.horario}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">Horario:</span>
                              )}
                            </div>
                            {/* Encabezado */}
                            <div className="text-xs font-semibold text-gray-500 mb-1 px-1">
                              Estudiantes matriculados y sus calificaciones:
                            </div>
                            {data.students.map((student: any) => {
                              const studentGrades = getTeacherGrades(
                                student._id,
                                subject._id
                              );
                              return (
                                <div
                                  key={student._id}
                                  className="bg-white rounded border mb-2 text-xs overflow-hidden"
                                >
                                  {/* Fila del estudiante */}
                                  <div className="flex items-center px-2 py-2 gap-2">
                                    <span className="flex-1 font-semibold text-blue-700 truncate min-w-0">
                                      {student.nombre} {student.apellido}
                                    </span>
                                    <button
                                      className="text-white rounded px-2 py-1 whitespace-nowrap text-xs shrink-0"
                                      style={{ backgroundColor: "#4e73df" }}
                                      onClick={() =>
                                        openModal(
                                          student,
                                          subject,
                                          data.courseObj,
                                          data.periodObj,
                                          data.teacherObj
                                        )
                                      }
                                    >
                                      + Registrar nota
                                    </button>
                                  </div>
                                  {/* Notas registradas */}
                                  {studentGrades.length > 0 ? (
                                    <div className="border-t bg-slate-50 px-2 py-1">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="text-gray-500">
                                            <th className="text-left py-1 pr-2">Descripción</th>
                                            <th className="text-left py-1 pr-2">Bimestre</th>
                                            <th className="text-center py-1">Nota</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {studentGrades.map((g: any, gi: number) => (
                                            <tr key={gi} className="border-t">
                                              <td className="py-1 pr-2 text-gray-700">{g.descripcion || "—"}</td>
                                              <td className="py-1 pr-2 text-gray-700">{g.bimestre}</td>
                                              <td className="py-1 text-center font-bold"
                                                style={{ color: g.grade >= 7 ? "#16a34a" : "#dc2626" }}
                                              >
                                                {g.grade}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="border-t bg-slate-50 px-2 py-1 text-gray-400 italic">
                                      Sin calificaciones registradas
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p>
                      No hay cursos asignados o la información del docente no está disponible
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
