import { useEffect, useState } from "react";
import { ModalProps, Teacher } from "../../../backend/types";
import { useAuth } from "../../hooks/use_auth";
import { toast } from "react-toastify";
import HttpClient from "../../utils/http_client";

interface Props extends ModalProps<Teacher> {
  initialData?: Teacher;
}

const TeacherbySubjectModal = (props: Props) => {
  const { auth } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherData, setSelectedTeacherData] = useState<Teacher | null>(null);

  const loadData = async () => {
    const response = await HttpClient("/api/teachers", "GET", auth.userName, auth.role);
    if (response.success) {
      setTeachers(response.data);
    } else {
      toast.warning(response.message);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setSearchTerm("");
    setSelectedTeacherData(null);
    props.close();
  };

  const handleSelectTeacher = (teacher: any) => {
    setSelectedTeacherData({ ...teacher, id: teacher.id });
    setSearchTerm(`${teacher.nombre} ${teacher.apellido}`);
  };

  const handleGuardar = () => {
    if (selectedTeacherData) {
      props.onDone(selectedTeacherData);
      setSearchTerm("");
      setSelectedTeacherData(null);
      props.close();
    } else {
      toast.warning("Selecciona un docente de la lista");
    }
  };

  const displayedTeachers = selectedTeacherData
    ? []
    : teachers.filter((teacher: any) =>
        searchTerm.length === 0 ||
        `${teacher.nombre} ${teacher.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          props.visible ? "" : "hidden"
        }`}
      >
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="bg-white p-6 rounded shadow-lg z-10 w-2/3 h-5/6 overflow-y-auto">
          <div
            style={{ color: "#94a3b8" }}
            className="text-center text-xl mb-2 font-semibold"
          >
            AGREGAR NUEVO DOCENTE
          </div>
          <hr />
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-3">
            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                * Nombres del docente
              </label>
              <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Buscar docente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedTeacherData(null);
                }}
              />
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded mt-1">
                {displayedTeachers.map((teacher: any, index: number) => (
                  <div
                    key={index}
                    onMouseDown={() => handleSelectTeacher(teacher)}
                    className="cursor-pointer p-2 hover:bg-blue-100 border-b border-gray-100"
                  >
                    {teacher.nombre} {teacher.apellido}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr />
          <div className="justify-end mt-3 grid md:grid-cols-4 grid-cols-1 gap-4">
            <div className="md:col-end-4">
              <button
                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full text-sm"
                type="button"
                onClick={handleGuardar}
              >
                Guardar
              </button>
            </div>
            <div>
              <button
                type="button"
                className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded-full text-sm"
                onClick={handleClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherbySubjectModal;

