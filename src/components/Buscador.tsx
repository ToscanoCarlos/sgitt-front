// Buscador.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { BiSearchAlt } from 'react-icons/bi';
import { MdOutlineCancel } from "react-icons/md";
import { buscarProfesores, buscarAlumnos } from '../app/utils/api';
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { GiSharkFin } from "react-icons/gi";

interface Materia {
  id: number;
  nombre: string;
}

interface Profesor {
  id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  materias: Materia[];
  areas_profesor: Array<{id: number, nombre: string}>;
  departamento: string;  
}

interface Alumno {
  id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera: string;
  areas_alumno: Array<{id: number, nombre: string}>;
}

interface BuscadorProps {
  onSearch: (term: string) => void;
}


const Buscador: React.FC<BuscadorProps> = ({ onSearch }) => {
  const [buscar, setBuscar] = useState("");
  const [resultados, setResultados] = useState<Array<Profesor | Alumno>>([]);
  const [userType, setUserType] = useState<'alumno' | 'profesor' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('user-Type') as 'alumno' | 'profesor';
    setUserType(storedUserType);
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (userType === 'alumno') {
        const profesores = await buscarProfesores(buscar);
        setResultados(profesores);
      } else {
        const alumnos = await buscarAlumnos(buscar);
        setResultados(alumnos);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError('Ocurrió un error al realizar la búsqueda. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactar = (resultado: Profesor | Alumno) => {
    console.log(`Contactando a ${resultado.nombre}`);
  };

  const renderResultado = (resultado: Profesor | Alumno) => {
    const esProfesor = 'materias' in resultado;
    const Icon = esProfesor ? FaChalkboardTeacher : FaUserGraduate;

    return (
      <div key={resultado.id} 
           className='bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
        <div className="flex flex-col h-full space-y-4">
          {/* Encabezado con icono */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${esProfesor ? 'bg-green-100' : 'bg-blue-100'}`}>
              <Icon className={`w-6 h-6 ${esProfesor ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-800'>
                {`${resultado.nombre} ${resultado.apellido_paterno} ${resultado.apellido_materno}`}
              </h3>
              <p className="text-sm text-gray-500">
                {esProfesor ? 'Profesor' : 'Alumno'}
              </p>
            </div>
          </div>
          
          {/* Información de contacto */}
          
          
          <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 text-sm flex flex-wrap items-start gap-2">
              <span className="font-semibold">Correo:</span>
              <span className="text-gray-600 break-all">{resultado.email}</span>
            </p>
            {esProfesor ? (
              <p className="text-gray-700 text-sm flex items-center gap-2">
                <span className="font-semibold">Departamento:</span>
                <span className="text-gray-600">{(resultado as Profesor).departamento}</span>
              </p>
            ) : (
              <p className="text-gray-700 text-sm flex items-center gap-2">
                <span className="font-semibold">Carrera:</span>
                <span className="text-gray-600">{(resultado as Alumno).carrera}</span>
              </p>
            )}
          </div>

          {/* Sección de materias para profesores */}
          {esProfesor && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Materias:</h4>
              <div className="flex flex-wrap gap-2">
                {(resultado as Profesor).materias.length > 0 ? (
                  (resultado as Profesor).materias.map((materia) => (
                    <span key={materia.id} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full transition-colors hover:bg-blue-200">
                      {materia.nombre}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay materias registradas</p>
                )}
              </div>
            </div>
          )}

          {/* Sección de áreas de conocimiento */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Áreas de conocimiento:</h4>
            <div className="flex flex-wrap gap-2">
              {((esProfesor ? (resultado as Profesor).areas_profesor : (resultado as Alumno).areas_alumno) || []).length > 0 ? (
                (esProfesor ? (resultado as Profesor).areas_profesor : (resultado as Alumno).areas_alumno).map((area) => (
                  <span key={area.id} 
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full transition-colors hover:bg-green-200">
                    {area.nombre}
                  </span>
                ))
              ) : (
                <div className="w-full text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 italic">No hay áreas de conocimiento registradas</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {esProfesor ? 
                      "El profesor aún no ha especificado sus áreas de especialización" :
                      "El alumno aún no ha especificado sus áreas de interés"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botón de contacto */}
          <button 
            className='mt-auto w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary 
                       transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50'
            onClick={() => handleContactar(resultado)}
          >
            Contactar
          </button>
        </div>
      </div>
    );
  };

  return (
    
      <div className='bg-secondary rounded-lg p-4 sm:p-6 lg:p-8 space-y-6 mt-4 mx-auto max-w-7xl w-full '>
        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className='w-full'>
          <div className='flex flex-col sm:flex-row items-center rounded-xl gap-4 p-4 sm:p-5 shadow-md bg-white'>
            <div className='flex gap-2 items-center w-full'>
              <BiSearchAlt className='text-xl text-gray-400' />
              <input 
                type="text" 
                className='w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-400'
                placeholder={userType === 'alumno' ? 
                  'Ingresa tu objetivo / idea de protocolo para recomendar profesores' : 
                  'Buscar alumnos por área de conocimiento'}
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
              {buscar && (
                <MdOutlineCancel 
                  className='text-xl text-red-500 hover:text-gray-700 cursor-pointer transition-colors'
                  onClick={() => setBuscar('')}
                />
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className='w-full sm:w-auto px-6 py-2 bg-oscure text-white rounded-xl 
                         hover:bg-primary transition-colors disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Resultados */}
        {resultados.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {resultados.map(renderResultado)}
          </div>
        ) : (
          buscar && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <GiSharkFin className="text-6xl text-gray-400 mb-4" />
              <p className="text-xl text-gray-500 text-center">
                No se encontraron resultados para tu búsqueda
              </p>
              <p className="text-gray-400 mt-2 text-center">
                Intenta con otros términos o áreas de conocimiento
              </p>
            </div>
          )
        )}

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    
  );
};

export default Buscador;