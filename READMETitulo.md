# 📱 MediPAP

***Plataforma Móvil para la Gestión y Seguimiento del Papanicolaou en Consultorios Públicos***

***Proyecto de Título - Avance***

***

## 👨‍💻 Integrantes

- José Miguel Peña Salinas
- Francisco Javier Bravo Acevedo

***

## 📝 Descripción

MediPAP es una aplicación móvil desarrollada para facilitar la gestión y seguimiento de los exámenes Papanicolaou (PAP) en mujeres atendidas en centros de salud públicos. Su propósito es mejorar el control preventivo del cáncer cervicouterino mediante:

- Registro eficiente de datos clínicos
- Visualización del estado de vigencia del PAP
- Generación estadísticas
- Asignación de roles con distintos niveles de acceso
- Asociación de usuarios a unidades de salud gestionadas por administradores

***

## ✅ Requerimientos Funcionales (RF)

### RF-01: Login de usuario mediante correo y contraseña
- **RF-01.1:** Validación de credenciales
- **RF-01.2:** Opción "recordar sesión" mediante token
- **RF-01.3:** Recuperación de contraseña vía código por correo

### RF-02: Búsqueda de usuarios por RUT escrito o escaneado desde QR
- **RF-02.1:** Desencriptado automático del QR
- **RF-02.2:** Registro de búsquedas realizadas
- **RF-02.3:** Mensaje informativo si el usuario no existe
- **RF-02.4:** Ordenar resultados por nombre (A–Z / Z–A)

### RF-03: Edición de datos de usuario por parte del administrador
- **RF-03.1:** Validación de campos al crear nuevos usuarios
- **RF-03.2:** Almacenamiento seguro de datos validados

### RF-04: Gestión de archivos Excel/CSV con registros PAP
- **RF-04.1:** Importación automática de datos clínicos

### RF-05: Visualización y análisis de reportes de uso
- **RF-05.1:** Filtro por día, semana, mes o año
- **RF-05.2:** Estadísticas por usuario y a nivel general
- **RF-05.3:** Filtro por estado del PAP o fecha

### RF-06: Configuración de campos visibles para los usuarios

### RF-07: Profesionales pueden ver datos y exámenes de sus pacientes
- Notificaciones ante PAP no vigente

### RF-08: Dashboard con estadísticas del sistema
- Usuarios, vigencia, búsquedas, alertas, etc.

### RF-09: Asociación de usuarios a unidades de salud
- Creadas por el administrador

***

## 🔒 Requerimientos No Funcionales (RNF)

- **RNF-01:** Mantener la sesión activa hasta cierre manual o expiración
- **RNF-02:** Optimización del rendimiento en inserción de datos
- **RNF-03:** Evitar sobrecarga por escritura masiva
- **RNF-04:** Minimizar renderizaciones innecesarias para mejorar fluidez
- **RNF-05:** Autenticación robusta y segura en backend
- **RNF-06:** Interfaz amigable, accesible y visualmente coherente, con predominancia de colores rosados y tonos pastel

***

## 🧪 Tecnologías Utilizadas

- **Backend:** NestJS
- **Frontend:** React Native + Expo
- **Diseño UI:** Figma
- **Base de Datos:** PostgreSQL
- **Gestión de BD local:** TablePlus

***

## 🚀 Instrucciones para Ejecutar la Aplicación

1. Asegúrarse de tener instalado **Expo Go** en dispositivo móvil
2. Abrir el proyecto en **Visual Studio Code**
3. Ejecutar el siguiente comando en la terminal: npx expo start --clear
4. Escanear el código QR con **Expo Go** para iniciar la app en tu celular

***

## ⚙️ Configuración .env

⚠️ **Importante:** El archivo `.env` debe apuntar al servidor entregado por la empresa, ya que:

- El backend local necesita datos y accesos que no se entregan públicamente
- Es necesario contar con un túnel SSH para acceder a la base de datos
- El backend adjunto en este repositorio corresponde al mismo que se encuentra en producción, pero no contiene la conexión base de datos completa debido al túnel SSH
- Se adjunta EXCEL con tablas para cargar con datos de pacientes alterados y antiguos

***

## 🔐 Credenciales de Prueba

Estos usuarios han sido creados para efectos de testeo:

### 👩‍⚕️ Usuario Administrador
- **Usuario:** `sandracano`
- **Contraseña:** `titulo2025`

### 👤 Usuario Normal
- **Usuario:** `ivanmercado`
- **Contraseña:** `titulo2025`

***

## 📩 Soporte

En caso de que la aplicación no logre conectarse con el backend en la nube (posibles caídas, mantenimientos o cambios de IP), favor informar por correo electrónico para que se solucione lo antes posible:

📧 **franciscobravoacevedo.01@gmail.com**
