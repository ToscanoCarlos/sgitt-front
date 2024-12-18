import axios, { AxiosError } from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';


interface UserData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  boleta: string;
  email: string;
  carrera: string;
  plan_estudios: string;
  password: string;
  confirmPassword: string;
  areas_ids: number[];
  areas_custom: string[];
  is_admin?: boolean;
}

interface Confidence {
  score: number;
  level: string;
}


interface Credentials {
  email: string;
  password: string;
}


interface PropuestaData {
  nombre: string;
  objetivo: string;
  cantidad_alumnos: number;
  cantidad_profesores: number;
  requisitos: string[];
  palabras_clave: string[];
  areas: string[];
  tipo_propuesta: string;
  datos_contacto: string[];
  visible?: boolean;
}


// En Propuesta
interface Propuesta {
  id: number;
  nombre: string;
  objetivo: string;
  cantidad_alumnos: number;
  cantidad_profesores: number;
  requisitos: { id: number; descripcion: string }[];
  palabras_clave: { id: number; palabra: string }[];
  areas: { id: number; nombre: string }[];
  carrera: string;
  tipo_propuesta: string;
  datos_contacto: { id: number; dato: string }[];
  autor: {
    id: number;
    nombre: string;
    email: string;
    tipo: 'alumno' | 'profesor';
  };
  fecha_creacion: string;
  fecha_actualizacion: string;
  visible: boolean;
}


interface Area {
  id: number;
  nombre: string;
}
// En src/app/utils/api.ts

export const register = async (userData: UserData): Promise<ApiResponse> => {
  try {
    // Reestructurar los datos antes de enviarlos
    const dataToSend = {
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      nombre: userData.nombre,
      apellido_paterno: userData.apellido_paterno,
      apellido_materno: userData.apellido_materno || '',
      boleta: userData.boleta,
      carrera: userData.carrera,
      plan_estudios: userData.plan_estudios,
      areas_ids: userData.areas_ids || [],
      areas_custom: userData.areas_custom || [],
      user: {
        email: userData.email,
        first_name: userData.nombre,
        last_name: userData.apellido_paterno
      }
    };

    const response = await axios.post<ApiResponse>(
      `${API_URL}/register/`, 
      dataToSend,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.errors) {
        throw error.response.data;
      }
      throw { errors: { general: error.response?.data?.error || error.message } };
    }
    throw { errors: { general: "Error inesperado durante el registro" } };
  }
};


export const login = async (credentials: Credentials): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(`${API_URL}/login/`, credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error(error.response.data.error || "No tienes permiso para acceder. Verifica tu correo o contacta al administrador.");
      } else if (error.response?.status === 401) {
        throw new Error("Credenciales inválidas. Por favor, verifica tu correo y contraseña.");
      }
      throw error.response?.data?.error || "Ocurrió un error al iniciar sesión.";
    }
    throw new Error("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
  }
};


interface ApiResponse {
  refresh: string;
  access: string;
  user_type: string;
  user_email: string;
  primer_inicio: boolean;
  is_admin: boolean;
}


export const crearPropuesta = async (propuestaData: PropuestaData): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('Token:', token);
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.post<ApiResponse>(`${API_URL}/propuestas/`, propuestaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.response?.data);
      throw error.response?.data || error.message;
    }
    console.error('Error no Axios:', error);
    throw error;
  }
};


export const verifyEmail = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/verify-email/${token}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Si la respuesta contiene datos, devuélvelos
      if (error.response?.data) {
        return error.response.data;
      }
      throw error.response?.data || error.message;
    }
    throw error;
  }
};




export const obtenerPropuestasUsuario = async (): Promise<Propuesta[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get<Propuesta[]>(`${API_URL}/propuestas/mis_propuestas/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Propagamos el error de Axios para que sea manejado en el componente
      throw error;
    }
    throw new Error('Error inesperado al obtener las propuestas');
  }
};


interface Profesor {
  id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  materias: Array<{
    id: number;
    nombre: string;
  }>;
  areas_profesor: Array<{
    id: number;
    nombre: string;
  }>;
  es_profesor: boolean;
  confidence?: Confidence;
}


export const buscarProfesores = async (query: string): Promise<any[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get(`${API_URL}/profesores/buscar/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.response?.data);
      throw error.response?.data || error.message;
    }
    console.error('Error no Axios:', error);
    throw error;
  }
};








export const obtenerPropuestas = async (): Promise<Propuesta[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get<Propuesta[]>(`${API_URL}/propuestas/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Error inesperado al obtener las propuestas');
  }
};


export const obtenerAreas = async (): Promise<Area[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get<Area[]>(`${API_URL}/areas/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Error inesperado al obtener las áreas');
  }
};




export const actualizarPropuesta = async (id: number, propuestaData: PropuestaData): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.put<ApiResponse>(
      `${API_URL}/propuestas/${id}/`,
      propuestaData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.response?.data);
      throw error.response?.data || error.message;
    }
    console.error('Error no Axios:', error);
    throw error;
  }
};




export const eliminarPropuesta = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    await axios.delete(`${API_URL}/propuestas/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.response?.data);
      throw error.response?.data || error.message;
    }
    throw error;
  }
};


export const obtenerMaterias = async (): Promise<any[]> => {
  try {
    const response = await axios.get<any[]>(`${API_URL}/materias/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Error inesperado al obtener las materias');
  }
}






export const obtenerPerfilAlumno = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get(`${API_URL}/alumnos/perfil/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil');
    }
    throw new Error('Error inesperado al obtener el perfil');
  }
};






export const obtenerPerfilProfesor = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get(`${API_URL}/profesores/perfil/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil');
    }
    throw new Error('Error inesperado al obtener el perfil');
  }
};






interface ActualizarPerfilData {
  areas_ids?: number[];
  materias_ids?: number[];
  areas_custom?: string[];
}


export const actualizarPerfilAlumno = async (data: ActualizarPerfilData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
    console.log('Data:', data);
    const response = await axios.patch(
      `${API_URL}/alumnos/perfil/`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
    throw new Error('Error inesperado al actualizar el perfil');
  }
};


export const actualizarPerfilProfesor = async (data: ActualizarPerfilData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
    console.log('Data:', data);
    const response = await axios.patch(
      `${API_URL}/profesores/perfil/`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
    throw new Error('Error inesperado al actualizar el perfil');
  }
};




export const actualizarVisibilidad = async (id: number, visible: boolean): Promise<void> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    await axios.patch(
      `${API_URL}/propuestas/${id}/toggle_visibility/`,
      { visible },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.response?.data);
      throw error.response?.data || error.message;
    }
    throw error;
  }
};


// En api.ts


interface CambioContrasenaData {
  password: string;
  confirmPassword: string;
}


export const cambiarContrasenaProfesor = async (data: CambioContrasenaData): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.post<ApiResponse>(
      `${API_URL}/cambiar-contrasena-profesor/`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );


    // Actualizar tokens en localStorage
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }


    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.error || 'Error al cambiar la contraseña';
    }
    throw error;
  }
};




export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(
      `${API_URL}/usuarios/reset-password-request/`,
      { email }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.error || 'Error al enviar el correo de restablecimiento';
    }
    throw new Error('Error inesperado al solicitar el restablecimiento de contraseña');
  }
};


export const resetPassword = async (token: string, passwords: { password: string, confirmPassword: string }): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(
      `${API_URL}/usuarios/reset-password/${token}/`,
      passwords
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.error || 'Error al restablecer la contraseña';
    }
    throw new Error('Error inesperado al restablecer la contraseña');
  }
};
export const cambiarContraseña = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.post(
      `${API_URL}/usuarios/cambiar-contrasena/`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );


    // Actualizar los tokens en el localStorage
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }


    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.error || 'Error al cambiar la contraseña';
    }
    throw error;
  }
};


export const buscarAlumnos = async (query: string): Promise<any[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }
   
    const response = await axios.get(`${API_URL}/alumno/buscar/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.response?.data);
      throw error.response?.data || error.message;
    }
    console.error('Error no Axios:', error);
    throw error;
  }
};


export const getAdminData = async (type: 'alumnos' | 'profesores' | 'propuestas') => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }


    // Actualizar la ruta para usar el prefijo crud
    const endpoint = `crud/${type}`;
   
    const response = await axios.get(`${API_URL}/${endpoint}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching data:', error.response?.data);
      throw error.response?.data || error.message;
    }
    throw error;
  }
};


export const createAdminItem = async (type: 'alumnos' | 'profesores' | 'propuestas', data: any) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }

    // Asegurarse de que is_admin se envíe como booleano
    const formattedData = {
      ...data,
      is_admin: data.is_admin === 'true'
    };

    const response = await axios.post(
      `${API_URL}/crud/${type}/`,
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating admin item:', error);
    throw error;
  }
};

export const updateAdminItem = async (type: 'alumnos' | 'profesores' | 'propuestas', id: number, data: any) => {
  try {
    console.log(`Intentando actualizar ${type} con ID:`, id, 'Datos:', data);
   
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }


    let endpoint = '';
    let formattedData = { ...data };


    // Formatear datos específicamente para alumnos
    if (type === 'alumnos') {
      endpoint = `/crud/alumnos/${id}/`; // Cambiado de crud/alumnos a alumnos
      formattedData = {
        email: data.email,
        nombre: data.nombre,
        apellido_paterno: data.apellido_paterno,
        apellido_materno: data.apellido_materno,
        boleta: data.boleta,
        carrera: data.carrera,
        plan_estudios: data.plan_estudios,
        password: data.password,
        confirm_password: data.confirm_password,
        is_admin: data.is_admin,
        user: {
          id: id,
          email: data.email,
          first_name: data.nombre,
          last_name: data.apellido_paterno
        }
      };
      console.log('Datos formateados para alumno:', formattedData);
    } else if (type === 'profesores') {
      endpoint = `/crud/profesores/${id}/`;
      formattedData = {
        ...data,
        user: {
          email: data.email,
          first_name: data.nombre,
          last_name: data.apellido_paterno,
        }
      };
    } else {
      endpoint = `/crud/propuestas/${id}/`;
    }


    console.log('Datos formateados para enviar:', formattedData);


    const response = await axios.put(
      `${API_URL}${endpoint}`,
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );


    return response.data;
  } catch (error) {
    console.error(`Error actualizando ${type}:`, error);
    if (axios.isAxiosError(error)) {
      console.log('URL que causó el error:', error.config?.url);
      console.log('Datos enviados:', error.config?.data);
    }
    throw error;
  }
};


export const deleteAdminItem = async (type: 'alumnos' | 'profesores' | 'propuestas', id: number) => {
  try {
    if (!id) {
      throw new Error('ID no proporcionado');
    }


    console.log(`Intentando eliminar ${type} con ID:`, id);
   
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }


    // Ajustar las rutas según tu backend
    let endpoint = '';
    switch (type) {
      case 'alumnos':
        endpoint = `/crud/alumnos/${id}/`;
        break;
      case 'profesores':
        endpoint = `/crud/profesores/${id}/`;
        break;
      case 'propuestas':
        endpoint = `/crud/propuestas/${id}/`;
        break;
    }


    console.log('URL completa:', `${API_URL}${endpoint}`);


    const response = await axios.delete(
      `${API_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );


    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('URL que causó el error:', error.config?.url);
      console.log('Respuesta del servidor:', error.response?.data);
      throw new Error(`Error al eliminar: ${error.response?.status} - ${error.response?.statusText}`);
    }
    throw error;
  }
};


// Añadir en api.ts

interface ConversationResponse {
  id: number;
  name: string;
  participants: any[];
  is_group: boolean;
}

export const createOrGetConversation = async (participantId: number): Promise<ConversationResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }

    const response = await axios.post<ConversationResponse>(
      `${API_URL}/chat/conversations/create_or_get_conversation/`,
      {
        participant_ids: [participantId],
        is_group: false
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const getAdminMetrics = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/crud/metrics/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

// Obtener datos para las métricas específicas
export const getMetricsByDate = async (startDate: string, endDate: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(
      `${API_URL}/crud/metrics/by-date/?start=${startDate}&end=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics by date:', error);
    throw error;
  }
};

interface ReportProblem {
  type: string;
  description: string;
  email: string;
}

export const submitProblemReport = async (report: ReportProblem) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_URL}/reports/problem/`,
      report,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error al enviar reporte');
    }
    throw error;
  }
};